import express from 'express';
import runImport from '../controllers/import.js';
import getHistory from '../controllers/history.js';

const router = express.Router();

// POST /import/run - Start import process
router.post('/run', runImport);

// GET /import/history - Get import history
router.get('/history', getHistory);

export default router;

