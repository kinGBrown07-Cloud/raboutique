import { Pool } from 'pg';
import { SimpleLinearRegression, ExponentialSmoothing } from 'ml-regression';
import { Matrix } from 'ml-matrix';
import { getMetricData } from './monitoring.service';
import { NotificationService } from './notification.service';

interface PredictionResult {
    timestamp: Date;
    value: number;
    confidence: number;
    anomaly: boolean;
}

export class PredictionService {
    private static readonly TRAINING_WINDOW = 24 * 60 * 60 * 1000; // 24 heures
    private static readonly PREDICTION_HORIZON = 60 * 60 * 1000; // 1 heure
    private static readonly ANOMALY_THRESHOLD = 2.5; // Écarts-types

    private static async getTrainingData(metric: string): Promise<{ timestamps: number[], values: number[] }> {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - this.TRAINING_WINDOW);
        
        const data = await getMetricData(metric, startTime, endTime);
        
        return {
            timestamps: data.map(d => d.timestamp.getTime()),
            values: data.map(d => d.value)
        };
    }

    private static calculateConfidenceInterval(predictions: number[], stdDev: number): number[] {
        const z = 1.96; // 95% confidence interval
        return predictions.map(pred => pred + z * stdDev);
    }

    private static detectAnomalies(values: number[], mean: number, stdDev: number): boolean[] {
        return values.map(value => {
            const zScore = Math.abs((value - mean) / stdDev);
            return zScore > this.ANOMALY_THRESHOLD;
        });
    }

    private static async trainModel(metric: string) {
        const { timestamps, values } = await this.getTrainingData(metric);
        
        // Convertir les timestamps en features (heures depuis le début)
        const X = new Matrix(timestamps.map(t => [
            (t - timestamps[0]) / (60 * 60 * 1000), // heures
            Math.sin(2 * Math.PI * t / (24 * 60 * 60 * 1000)), // composante journalière
            Math.sin(2 * Math.PI * t / (7 * 24 * 60 * 60 * 1000)) // composante hebdomadaire
        ]));

        const y = Matrix.columnVector(values);

        // Régression linéaire multiple avec composantes saisonnières
        const regression = new SimpleLinearRegression(X, y);

        // Exponential smoothing pour la tendance
        const smoothing = new ExponentialSmoothing(values, { alpha: 0.2 });

        return { regression, smoothing, baseTime: timestamps[0] };
    }

    public static async predictMetric(metric: string): Promise<PredictionResult[]> {
        try {
            const { regression, smoothing, baseTime } = await this.trainModel(metric);
            const { timestamps, values } = await this.getTrainingData(metric);

            // Calculer les statistiques de base
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const stdDev = Math.sqrt(
                values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
            );

            // Générer les prédictions
            const predictions: PredictionResult[] = [];
            const now = Date.now();

            for (let t = now; t < now + this.PREDICTION_HORIZON; t += 5 * 60 * 1000) { // prédictions toutes les 5 minutes
                const hoursSinceBase = (t - baseTime) / (60 * 60 * 1000);
                const features = [
                    hoursSinceBase,
                    Math.sin(2 * Math.PI * t / (24 * 60 * 60 * 1000)),
                    Math.sin(2 * Math.PI * t / (7 * 24 * 60 * 60 * 1000))
                ];

                // Combiner les prédictions des deux modèles
                const regressionPred = regression.predict(features);
                const smoothingPred = smoothing.forecast(1)[0];
                const prediction = (regressionPred + smoothingPred) / 2;

                // Calculer l'intervalle de confiance
                const confidence = this.calculateConfidenceInterval([prediction], stdDev)[0];

                // Détecter les anomalies
                const isAnomaly = this.detectAnomalies([prediction], mean, stdDev)[0];

                predictions.push({
                    timestamp: new Date(t),
                    value: prediction,
                    confidence,
                    anomaly: isAnomaly
                });

                // Notifier si une anomalie est détectée
                if (isAnomaly) {
                    await NotificationService.sendAlert({
                        type: 'ANOMALY_DETECTED',
                        metric,
                        value: prediction,
                        threshold: mean + this.ANOMALY_THRESHOLD * stdDev,
                        timestamp: new Date(t)
                    });
                }
            }

            return predictions;
        } catch (error) {
            console.error('Erreur lors de la prédiction:', error);
            throw new Error('Erreur lors de la prédiction des métriques');
        }
    }

    public static async detectAnomalies(metric: string): Promise<{
        timestamp: Date;
        value: number;
        expected: number;
        deviation: number;
    }[]> {
        const { timestamps, values } = await this.getTrainingData(metric);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
            values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
        );

        return values.map((value, i) => {
            const deviation = Math.abs((value - mean) / stdDev);
            return {
                timestamp: new Date(timestamps[i]),
                value,
                expected: mean,
                deviation
            };
        }).filter(result => result.deviation > this.ANOMALY_THRESHOLD);
    }

    public static async analyzeTrends(metric: string): Promise<{
        trend: 'up' | 'down' | 'stable';
        changeRate: number;
        seasonality: {
            daily: boolean;
            weekly: boolean;
        };
    }> {
        const { timestamps, values } = await this.getTrainingData(metric);

        // Calculer la tendance
        const regression = new SimpleLinearRegression(
            timestamps.map(t => [(t - timestamps[0]) / (60 * 60 * 1000)]),
            values
        );

        const changeRate = regression.slope;
        const trend = Math.abs(changeRate) < 0.1 ? 'stable' 
            : changeRate > 0 ? 'up' 
            : 'down';

        // Détecter la saisonnalité
        const fft = this.calculateFFT(values);
        const dailyComponent = this.detectPeriodicity(fft, 24);
        const weeklyComponent = this.detectPeriodicity(fft, 24 * 7);

        return {
            trend,
            changeRate,
            seasonality: {
                daily: dailyComponent > 0.3,
                weekly: weeklyComponent > 0.3
            }
        };
    }

    private static calculateFFT(values: number[]): number[] {
        // Implémentation simple de la FFT
        // Dans un environnement de production, utilisez une bibliothèque dédiée
        return values.map(() => Math.random()); // Simulé pour l'exemple
    }

    private static detectPeriodicity(fft: number[], period: number): number {
        // Analyse de la puissance spectrale pour la période donnée
        // Dans un environnement de production, utilisez une bibliothèque dédiée
        return Math.random(); // Simulé pour l'exemple
    }
}
