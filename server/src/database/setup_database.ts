import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
    try {
        // Connexion en tant que root
        const rootConnection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        console.log('✅ Connecté en tant que root');

        // S'assurer que la base de données existe
        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS remag_db`);
        console.log('✅ Base de données créée/vérifiée');

        // Sélectionner la base de données
        await rootConnection.query(`USE remag_db`);
        console.log('✅ Base de données sélectionnée');

        // Création de l'utilisateur
        await rootConnection.query(`
            CREATE USER IF NOT EXISTS 'remag_user'@'localhost' IDENTIFIED BY 'ReMag2024Secure!';
        `);
        console.log('✅ Utilisateur créé');

        // Attribution des privilèges
        await rootConnection.query(`
            GRANT ALL PRIVILEGES ON remag_db.* TO 'remag_user'@'localhost';
        `);
        console.log('✅ Privilèges attribués');

        // Application des privilèges
        await rootConnection.query('FLUSH PRIVILEGES');
        console.log('✅ Privilèges appliqués');

        // Lecture et exécution du fichier optimized_queries.sql
        const optimizedQueriesPath = path.join(__dirname, 'optimized_queries.sql');
        const optimizedQueries = fs.readFileSync(optimizedQueriesPath, 'utf8');

        // Séparation des requêtes (en supposant qu'elles sont séparées par des points-virgules)
        const queries = optimizedQueries.split(';').filter(query => query.trim());

        // Exécution de chaque requête
        for (const query of queries) {
            if (query.trim()) {
                try {
                    await rootConnection.query(query);
                } catch (err) {
                    const error = err as Error;
                    console.warn(`⚠️ Attention lors de l'exécution de la requête : ${error.message}`);
                }
            }
        }

        console.log('✅ Optimisations appliquées');

        // Fermeture de la connexion root
        await rootConnection.end();
        console.log('✅ Configuration terminée avec succès');

        // Test de la nouvelle connexion utilisateur
        console.log('\nTest de la nouvelle connexion utilisateur...');
        const userConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connexion utilisateur réussie');
        await userConnection.end();

    } catch (err) {
        const error = err as Error;
        console.error('❌ Erreur lors de la configuration :', error.message);
        process.exit(1);
    }
}

setupDatabase();
