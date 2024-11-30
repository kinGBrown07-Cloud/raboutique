import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupProcedures() {
    try {
        // Connexion à la base de données
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true // Important pour exécuter plusieurs requêtes
        });

        console.log('✅ Connecté à la base de données');

        // Liste des fichiers SQL à exécuter
        const proceduresDir = path.join(__dirname, 'procedures');
        const triggersDir = path.join(__dirname, 'triggers');
        
        // Exécuter les procédures stockées
        const procedureFiles = fs.readdirSync(proceduresDir);
        for (const file of procedureFiles) {
            if (file.endsWith('.sql')) {
                const filePath = path.join(proceduresDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                
                try {
                    await connection.query(sql);
                    console.log(`✅ Procédure ${file} installée`);
                } catch (err) {
                    const error = err as Error;
                    console.warn(`⚠️ Erreur lors de l'installation de ${file}: ${error.message}`);
                }
            }
        }

        // Exécuter les triggers
        const triggerFiles = fs.readdirSync(triggersDir);
        for (const file of triggerFiles) {
            if (file.endsWith('.sql')) {
                const filePath = path.join(triggersDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                
                try {
                    await connection.query(sql);
                    console.log(`✅ Trigger ${file} installé`);
                } catch (err) {
                    const error = err as Error;
                    console.warn(`⚠️ Erreur lors de l'installation de ${file}: ${error.message}`);
                }
            }
        }

        // Vérification finale
        const [procedures] = await connection.query('SHOW PROCEDURE STATUS WHERE Db = ?', [process.env.DB_NAME]);
        const [triggers] = await connection.query('SHOW TRIGGERS FROM ??', [process.env.DB_NAME]);

        console.log(`\n✅ Installation terminée :`);
        console.log(`- ${(procedures as any[]).length} procédures stockées`);
        console.log(`- ${(triggers as any[]).length} triggers`);

        await connection.end();

    } catch (err) {
        const error = err as Error;
        console.error('❌ Erreur lors de la configuration :', error.message);
        process.exit(1);
    }
}

setupProcedures();
