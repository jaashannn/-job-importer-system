import express from 'express';
import importRoutes from './routes/import.js';

const app = express();

app.use(express.json());

// Routes
app.use('/import', importRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

export default app;