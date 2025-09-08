import winston from 'winston'

const logger = winston.createLogger({
	level: 'error',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json()
	),
	transports: [
		new winston.transports.File({ filename: 'logs/error.log' }),
		new winston.transports.Console()
	]
})

export const errorHandler = (err, req, res, next) => {
	// Log the error
	logger.error({
		message: err.message,
		stack: err.stack,
		url: req.url,
		method: req.method,
		ip: req.ip,
		userAgent: req.get('User-Agent')
	})

	// Default to 500 server error
	let error = {
		message: err.message || 'Internal Server Error',
		status: err.status || 500
	}

	// Mongoose bad ObjectId
	if (err.name === 'CastError') {
		error = {
			message: 'Resource not found',
			status: 404
		}
	}

	// Mongoose duplicate key
	if (err.code === 11000) {
		error = {
			message: 'Duplicate field value entered',
			status: 400
		}
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors).map(val => val.message).join(', ')
		error = {
			message,
			status: 400
		}
	}

	// JWT errors
	if (err.name === 'JsonWebTokenError') {
		error = {
			message: 'Invalid token',
			status: 401
		}
	}

	if (err.name === 'TokenExpiredError') {
		error = {
			message: 'Token expired',
			status: 401
		}
	}

	res.status(error.status).json({
		success: false,
		error: error.message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	})
}
