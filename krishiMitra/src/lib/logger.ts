import winston from 'winston'
import path from 'path'
import fs from 'fs'

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
    try {
        fs.mkdirSync(logsDir, { recursive: true })
    } catch (error) {
        console.warn('Could not create logs directory:', error)
    }
}

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'krishimitra' },
    transports: []
})

// Add file transports only if logs directory is accessible
if (fs.existsSync(logsDir)) {
    try {
        logger.add(new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }))

        logger.add(new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }))
    } catch (error) {
        console.warn('Could not setup file logging:', error)
    }
}

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }))
}

// Helper functions for different log levels
export const logInfo = (message: string, meta?: any) => {
    logger.info(message, meta)
}

export const logError = (message: string, error?: Error, meta?: any) => {
    logger.error(message, {
        error: error?.message,
        stack: error?.stack,
        ...meta
    })
}

export const logWarn = (message: string, meta?: any) => {
    logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
    logger.debug(message, meta)
}

// Function to log user interactions
export const logUserInteraction = (action: string, component: string, meta?: any) => {
    logger.info('User interaction', {
        action,
        component,
        timestamp: new Date().toISOString(),
        ...meta
    })
}

// Function to log API calls
export const logApiCall = (endpoint: string, method: string, statusCode: number, duration: number, meta?: any) => {
    logger.info('API call', {
        endpoint,
        method,
        statusCode,
        duration,
        timestamp: new Date().toISOString(),
        ...meta
    })
}

export default logger