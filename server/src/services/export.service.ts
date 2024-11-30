import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ReportService } from './report.service';
import { DateRange } from '../types/common';
import fs from 'fs';
import path from 'path';

export class ExportService {
    private static readonly EXPORT_DIR = path.join(__dirname, '../../exports');

    private static async ensureExportDir() {
        if (!fs.existsSync(this.EXPORT_DIR)) {
            fs.mkdirSync(this.EXPORT_DIR, { recursive: true });
        }
    }

    static async exportToExcel(
        dateRange: DateRange,
        filters: any = {}
    ): Promise<string> {
        await this.ensureExportDir();

        const workbook = new ExcelJS.Workbook();
        
        try {
            // Récupérer les données
            const financialReport = await ReportService.generateFinancialReport(dateRange, filters);
            const paymentStats = await ReportService.getPaymentMethodStats(dateRange);
            const topSellers = await ReportService.getTopSellers(dateRange);
            const refundStats = await ReportService.getRefundStats(dateRange);

            // Feuille rapport financier
            const financialSheet = workbook.addWorksheet('Rapport Financier');
            financialSheet.columns = [
                { header: 'Date', key: 'date' },
                { header: 'Type', key: 'transaction_type' },
                { header: 'Méthode', key: 'payment_method' },
                { header: 'Nombre', key: 'transaction_count' },
                { header: 'Montant Total', key: 'total_amount' },
                { header: 'Frais', key: 'total_fees' },
                { header: 'Commission', key: 'total_commission' }
            ];
            financialSheet.addRows(financialReport);

            // Feuille méthodes de paiement
            const paymentSheet = workbook.addWorksheet('Méthodes de Paiement');
            paymentSheet.columns = [
                { header: 'Méthode', key: 'payment_method' },
                { header: 'Utilisation', key: 'usage_count' },
                { header: 'Montant Total', key: 'total_amount' },
                { header: 'Frais Totaux', key: 'total_fees' }
            ];
            paymentSheet.addRows(paymentStats);

            // Feuille top vendeurs
            const sellersSheet = workbook.addWorksheet('Top Vendeurs');
            sellersSheet.columns = [
                { header: 'Vendeur', key: 'username' },
                { header: 'Transactions', key: 'transaction_count' },
                { header: 'Ventes Totales', key: 'total_sales' },
                { header: 'Commission', key: 'total_commission' }
            ];
            sellersSheet.addRows(topSellers);

            // Feuille remboursements
            const refundSheet = workbook.addWorksheet('Remboursements');
            refundSheet.columns = [
                { header: 'Type', key: 'transaction_type' },
                { header: 'Nombre', key: 'refund_count' },
                { header: 'Montant', key: 'refunded_amount' },
                { header: 'Délai Moyen (h)', key: 'avg_time_to_refund' }
            ];
            refundSheet.addRows(refundStats);

            // Sauvegarder le fichier
            const fileName = `rapport_${new Date().toISOString().split('T')[0]}.xlsx`;
            const filePath = path.join(this.EXPORT_DIR, fileName);
            await workbook.xlsx.writeFile(filePath);

            return filePath;
        } catch (error) {
            console.error('Export to Excel error:', error);
            throw new Error('Erreur lors de l\'export Excel');
        }
    }

    static async exportToPDF(
        dateRange: DateRange,
        filters: any = {}
    ): Promise<string> {
        await this.ensureExportDir();

        try {
            // Récupérer les données
            const financialReport = await ReportService.generateFinancialReport(dateRange, filters);
            const paymentStats = await ReportService.getPaymentMethodStats(dateRange);
            const topSellers = await ReportService.getTopSellers(dateRange);

            // Créer le PDF
            const fileName = `rapport_${new Date().toISOString().split('T')[0]}.pdf`;
            const filePath = path.join(this.EXPORT_DIR, fileName);
            
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // En-tête
            doc.fontSize(20).text('Rapport Financier', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Période: ${dateRange.start_date} - ${dateRange.end_date}`);
            doc.moveDown();

            // Rapport financier
            doc.fontSize(16).text('Résumé Financier');
            doc.moveDown();
            financialReport.forEach(row => {
                doc.fontSize(10).text(
                    `${row.date} - ${row.transaction_type}: ${row.total_amount}€ (${row.transaction_count} transactions)`
                );
            });
            doc.moveDown();

            // Méthodes de paiement
            doc.fontSize(16).text('Méthodes de Paiement');
            doc.moveDown();
            paymentStats.forEach(stat => {
                doc.fontSize(10).text(
                    `${stat.payment_method}: ${stat.total_amount}€ (${stat.usage_count} utilisations)`
                );
            });
            doc.moveDown();

            // Top vendeurs
            doc.fontSize(16).text('Top Vendeurs');
            doc.moveDown();
            topSellers.forEach((seller, index) => {
                doc.fontSize(10).text(
                    `${index + 1}. ${seller.username}: ${seller.total_sales}€ (${seller.transaction_count} ventes)`
                );
            });

            doc.end();

            return new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);
            });
        } catch (error) {
            console.error('Export to PDF error:', error);
            throw new Error('Erreur lors de l\'export PDF');
        }
    }
}
