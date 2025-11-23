import Log from '../models/log.js';

// Controller to get import history
const getHistory = async (req, res) => {
    try {
        // Get query parameters for pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch import logs with pagination
        const logs = await Log.find()
            .sort({ timestamp: -1 })  // Most recent first
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Log.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching import history:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching import history',
            error: error.message
        });
    }
};

export default getHistory;

