import pool from '../config/database';

async function checkTables() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database, checking tables...\n');
    
    const [tables] = await connection.query('SHOW TABLES FROM remag_db');
    console.log('Existing tables:', tables);
    
    connection.release();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkTables();
