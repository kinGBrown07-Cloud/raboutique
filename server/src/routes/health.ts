import express from 'express';
import pool from '../config/database';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    connection.release();
    
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
