import runImportProcess from '../services/import.js';

// Controller to run import process
const runImport = async (req, res) => {
    try {
        const result = await runImportProcess();
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);

    } catch (error) {
        console.error('Error in runImport:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error starting import process',
            error: error.message
        });
    }
};

export default runImport;

