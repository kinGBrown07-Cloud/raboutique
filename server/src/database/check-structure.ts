import pool from '../config/database';

async function checkTableStructure() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database, checking table structure...\n');
    
    const [result] = await connection.query('DESCRIBE listings');
    console.log('Listings table structure:', result);
    
    connection.release();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkTableStructure();
