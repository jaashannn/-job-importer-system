// Logger utility - Wrapper around console with timestamps and log levels

const getTimestamp = () => {
    return new Date().toISOString();
};

const formatMessage = (level, message) => {
    const timestamp = getTimestamp();
    return `[${timestamp}] [${level}] ${message}`;
};

const logger = {
    // Info logs - General information
    info: (message, ...args) => {
        console.log(formatMessage('INFO', message), ...args);
    },

    // Error logs - Errors and exceptions
    error: (message, ...args) => {
        console.error(formatMessage('ERROR', message), ...args);
    },

    // Warning logs - Warnings
    warn: (message, ...args) => {
        console.warn(formatMessage('WARN', message), ...args);
    },

    // Debug logs - Debug information (only in development)
    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(formatMessage('DEBUG', message), ...args);
        }
    },

    // Success logs - Success messages
    success: (message, ...args) => {
        console.log(formatMessage('SUCCESS', message), ...args);
    }
};

export default logger;

