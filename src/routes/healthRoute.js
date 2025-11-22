import express from 'express';
import { config } from '../config/config.js';
import mongoose from 'mongoose';

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    uptime: process.uptime()
  });
});

// Database health check
router.get('/health/database', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      res.status(200).json({
        status: 'healthy',
        database: states[dbState],
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        database: states[dbState],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API version info
router.get('/health/version', (req, res) => {
  res.status(200).json({
    version: '1.0.0',
    apiVersion: 'v1',
    name: 'Readian API',
    timestamp: new Date().toISOString()
  });
});

export default router;

