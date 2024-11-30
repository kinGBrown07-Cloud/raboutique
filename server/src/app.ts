import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, requestLogger, errorLogger } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import leaseRoutes from './routes/lease.routes';
import subscriptionRoutes from './routes/subscription.routes';
import promotionRoutes from './routes/promotion.routes';
import transactionRoutes from './routes/transaction.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import logRoutes from './routes/log.routes';
import monitoringRoutes from './routes/monitoring.routes';
import healthRouter from './routes/health';
import { MonitoringService } from './services/monitoring.service';
import { AlertService } from './services/alert.service';
import WebSocket from 'ws';
import db from './db'; // Assuming you have a db connection module
import { PredictionService } from './services/prediction.service'; // Assuming you have a prediction service module

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use(requestLogger);

// Debug middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'REMag API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/lease', leaseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api', healthRouter);

// Log registered routes
console.log('Registered Routes:');
const printRoutes = (stack: any[], prefix = '') => {
  stack.forEach((r) => {
    if (r.route) {
      const methods = Object.keys(r.route.methods).join(',').toUpperCase();
      console.log(`${methods} ${prefix}${r.route.path}`);
    } else if (r.name === 'router') {
      const newPrefix = prefix + r.regexp.toString().split('?')[0].replace(/\\\//g, '/').replace(/\^|\$/g, '');
      console.log(`Router at ${newPrefix}`);
      printRoutes(r.handle.stack, newPrefix);
    }
  });
};
printRoutes(app._router.stack);

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// Configuration des WebSockets pour les mises à jour en temps réel
const wsServer = new WebSocket.Server({ server: app.listen(3000) });

wsServer.on('connection', (socket) => {
    console.log('Client WebSocket connecté');

    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            // Gérer les messages WebSocket ici
        } catch (error) {
            console.error('Erreur WebSocket:', error);
        }
    });

    socket.on('close', () => {
        console.log('Client WebSocket déconnecté');
    });
});

// Configuration du système de monitoring
const monitoringConfig = {
    metricsInterval: 60000, // Collecter les métriques toutes les minutes
    predictionInterval: 3600000, // Faire des prédictions toutes les heures
    retentionDays: 30, // Garder les données pendant 30 jours
};

// Démarrer la collecte automatique des métriques
setInterval(async () => {
    try {
        await MonitoringService.collectSystemMetrics();
        await MonitoringService.collectBusinessMetrics();
    } catch (error) {
        console.error('Erreur lors de la collecte des métriques:', error);
    }
}, monitoringConfig.metricsInterval);

// Démarrer les prédictions automatiques
setInterval(async () => {
    try {
        const metrics = ['cpu_usage', 'memory_usage', 'active_users', 'transaction_volume'];
        for (const metric of metrics) {
            await PredictionService.predictMetric(metric);
            await PredictionService.detectAnomalies(metric);
        }
    } catch (error) {
        console.error('Erreur lors des prédictions:', error);
    }
}, monitoringConfig.predictionInterval);

// Nettoyage automatique des anciennes données
const cleanupOldData = async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - monitoringConfig.retentionDays);

    try {
        await db.query('DELETE FROM system_metrics WHERE created_at < ?', [oldDate]);
        await db.query('DELETE FROM business_metrics WHERE created_at < ?', [oldDate]);
        await db.query('DELETE FROM metric_predictions WHERE created_at < ?', [oldDate]);
        await db.query('DELETE FROM anomalies WHERE created_at < ?', [oldDate]);
        await db.query('DELETE FROM notification_history WHERE created_at < ?', [oldDate]);
    } catch (error) {
        console.error('Erreur lors du nettoyage des données:', error);
    }
};

// Exécuter le nettoyage une fois par jour
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);

export default app;
