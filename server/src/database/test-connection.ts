import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    try {
        // Création de la connexion
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connexion à la base de données établie');

        // Test des privilèges
        console.log('\nTest des privilèges...');
        
        // Test SELECT
        await connection.query('SELECT 1');
        console.log('✅ SELECT : OK');

        // Test INSERT
        await connection.query('CREATE TEMPORARY TABLE test_table (id INT)');
        await connection.query('INSERT INTO test_table VALUES (1)');
        console.log('✅ INSERT : OK');

        // Test UPDATE
        await connection.query('UPDATE test_table SET id = 2 WHERE id = 1');
        console.log('✅ UPDATE : OK');

        // Test DELETE
        await connection.query('DELETE FROM test_table WHERE id = 2');
        console.log('✅ DELETE : OK');

        // Test des procédures stockées
        console.log('\nTest des procédures stockées...');
        const [procedures] = await connection.query('SHOW PROCEDURE STATUS WHERE Db = ?', [process.env.DB_NAME]);
        console.log(`✅ Nombre de procédures stockées : ${(procedures as any[]).length}`);

        // Test des triggers
        console.log('\nTest des triggers...');
        const [triggers] = await connection.query('SHOW TRIGGERS FROM ??', [process.env.DB_NAME]);
        console.log(`✅ Nombre de triggers : ${(triggers as any[]).length}`);

        // Test des vues
        console.log('\nTest des vues...');
        const [views] = await connection.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = ?
        `, [process.env.DB_NAME]);
        console.log(`✅ Nombre de vues : ${(views as any[]).length}`);

        // Test des index
        console.log('\nTest des index...');
        const [indexes] = await connection.query(`
            SELECT DISTINCT table_name, index_name
            FROM information_schema.statistics
            WHERE table_schema = ?
        `, [process.env.DB_NAME]);
        console.log(`✅ Nombre d'index : ${(indexes as any[]).length}`);

        // Fermeture de la connexion
        await connection.end();
        console.log('\n✅ Tests terminés avec succès');

    } catch (error) {
        console.error('❌ Erreur lors des tests :', error);
        process.exit(1);
    }
}

testConnection();
