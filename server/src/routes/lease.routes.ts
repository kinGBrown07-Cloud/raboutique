import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../database/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/lease-applications');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Soumettre une candidature
router.post('/applications', authenticateToken, upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'businessPlan', maxCount: 1 },
    { name: 'certifications', maxCount: 1 },
    { name: 'financialPlan', maxCount: 1 }
]), async (req, res) => {
    try {
        const { listing_id } = req.body;
        const user_id = req.user.id;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Vérifier si l'annonce existe et est de type bail
        const [listing] = await db.query(
            'SELECT * FROM listings WHERE id = ? AND title LIKE "[BAIL]%"',
            [listing_id]
        );

        if (!listing.length) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Annonce non trouvée ou non éligible' 
            });
        }

        // Créer la candidature
        const [result] = await db.query(
            `INSERT INTO lease_applications 
            (listing_id, user_id, cv_path, business_plan_path, certifications_path, financial_plan_path) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                listing_id,
                user_id,
                files.cv?.[0]?.path,
                files.businessPlan?.[0]?.path,
                files.certifications?.[0]?.path,
                files.financialPlan?.[0]?.path
            ]
        );

        res.status(201).json({
            status: 'success',
            data: {
                application_id: result.insertId,
                message: 'Candidature soumise avec succès'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Obtenir les candidatures pour une annonce (propriétaire uniquement)
router.get('/applications/:listing_id', authenticateToken, async (req, res) => {
    try {
        const { listing_id } = req.params;
        
        // Vérifier que l'utilisateur est propriétaire de l'annonce
        const [listing] = await db.query(
            'SELECT * FROM listings WHERE id = ? AND user_id = ?',
            [listing_id, req.user.id]
        );

        if (!listing.length) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Accès non autorisé' 
            });
        }

        // Récupérer les candidatures
        const [applications] = await db.query(
            `SELECT la.*, u.email, u.name 
            FROM lease_applications la 
            JOIN users u ON la.user_id = u.id 
            WHERE la.listing_id = ?`,
            [listing_id]
        );

        res.json({
            status: 'success',
            data: { applications }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Mettre à jour le statut d'une candidature
router.patch('/applications/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Vérifier que l'utilisateur est propriétaire de l'annonce
        const [application] = await db.query(
            `SELECT l.user_id 
            FROM lease_applications la 
            JOIN listings l ON la.listing_id = l.id 
            WHERE la.id = ?`,
            [id]
        );

        if (!application.length || application[0].user_id !== req.user.id) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Accès non autorisé' 
            });
        }

        await db.query(
            'UPDATE lease_applications SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({
            status: 'success',
            message: 'Statut mis à jour'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Générer et signer un contrat de bail
router.post('/contracts/:application_id', authenticateToken, async (req, res) => {
    try {
        const { application_id } = req.params;
        const { start_date, end_date, monthly_rent } = req.body;

        // Vérifier l'autorisation et récupérer les données
        const [application] = await db.query(
            `SELECT la.*, l.title, l.description, u.name as tenant_name, u.email as tenant_email,
            owner.name as owner_name, owner.email as owner_email
            FROM lease_applications la 
            JOIN listings l ON la.listing_id = l.id
            JOIN users u ON la.user_id = u.id
            JOIN users owner ON l.user_id = owner.id
            WHERE la.id = ? AND la.status = 'approved'`,
            [application_id]
        );

        if (!application.length || application[0].owner_email !== req.user.email) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Accès non autorisé' 
            });
        }

        // Générer le PDF du contrat
        const contractPath = path.join(__dirname, '../../uploads/contracts', `contract-${application_id}.pdf`);
        const certificatePath = path.join(__dirname, '../../uploads/certificates', `certificate-${application_id}.pdf`);

        // Créer les dossiers si nécessaire
        fs.mkdirSync(path.dirname(contractPath), { recursive: true });
        fs.mkdirSync(path.dirname(certificatePath), { recursive: true });

        // Générer le contrat PDF
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(contractPath));
        
        // En-tête
        doc.fontSize(20).text('CONTRAT DE BAIL RURAL', { align: 'center' });
        doc.moveDown();
        
        // Informations du contrat
        doc.fontSize(12);
        doc.text(`Entre les soussignés:`);
        doc.text(`${application[0].owner_name} (Le Bailleur)`);
        doc.text(`${application[0].tenant_name} (Le Preneur)`);
        doc.moveDown();
        
        doc.text(`Objet du bail: ${application[0].title}`);
        doc.text(`Durée: du ${start_date} au ${end_date}`);
        doc.text(`Loyer mensuel: ${monthly_rent}€`);
        doc.moveDown();
        
        doc.text(application[0].description);
        doc.moveDown();
        
        // Signatures
        doc.text('Signatures:', { align: 'center' });
        doc.text('Le Bailleur:', { align: 'left' });
        doc.text('Le Preneur:', { align: 'right' });
        
        doc.end();

        // Générer le certificat PDF
        const cert = new PDFDocument();
        cert.pipe(fs.createWriteStream(certificatePath));
        
        cert.fontSize(20).text('CERTIFICAT D\'EXPLOITATION', { align: 'center' });
        cert.moveDown();
        
        cert.fontSize(12);
        cert.text(`Il est certifié que ${application[0].tenant_name}`);
        cert.text(`est autorisé(e) à exploiter les terres suivantes:`);
        cert.moveDown();
        cert.text(application[0].title);
        cert.text(`du ${start_date} au ${end_date}`);
        cert.moveDown();
        cert.text('Certificat délivré le ' + new Date().toLocaleDateString());
        
        cert.end();

        // Créer l'entrée dans la base de données
        const [contract] = await db.query(
            `INSERT INTO lease_contracts 
            (application_id, listing_id, user_id, start_date, end_date, monthly_rent, 
            contract_pdf_path, certificate_pdf_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                application_id,
                application[0].listing_id,
                application[0].user_id,
                start_date,
                end_date,
                monthly_rent,
                contractPath,
                certificatePath
            ]
        );

        res.status(201).json({
            status: 'success',
            data: {
                contract_id: contract.insertId,
                contract_path: contractPath,
                certificate_path: certificatePath
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Télécharger un document (contrat ou certificat)
router.get('/documents/:type/:id', authenticateToken, async (req, res) => {
    try {
        const { type, id } = req.params;
        
        // Vérifier l'autorisation
        const [contract] = await db.query(
            `SELECT * FROM lease_contracts 
            WHERE id = ? AND (user_id = ? OR EXISTS (
                SELECT 1 FROM listings l 
                WHERE l.id = lease_contracts.listing_id 
                AND l.user_id = ?
            ))`,
            [id, req.user.id, req.user.id]
        );

        if (!contract.length) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Accès non autorisé' 
            });
        }

        const filePath = type === 'contract' 
            ? contract[0].contract_pdf_path 
            : contract[0].certificate_pdf_path;

        res.download(filePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

export default router;
