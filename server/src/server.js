import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './config/db.js';
import startImportCron from './cron/import.js';
import logger from './utils/logger.js';

connectDB();
const PORT = process.env.PORT || 5000;

// Start cron job for automatic imports
startImportCron();

app.listen(PORT, () => {
    logger.success(`Server is running on port ${PORT}`);
});
