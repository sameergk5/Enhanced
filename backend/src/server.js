import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import winston from 'winston'
import app from './app.js'

dotenv.config()

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	defaultMeta: { service: 'wardrobe-api' },
	transports: [new winston.transports.Console()]
})

const server = createServer(app)
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] } })

io.on('connection', (socket) => {
	logger.info(`User connected: ${socket.id}`)
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
	logger.info(`🚀 Wardrobe AI Backend running on port ${PORT}`)
})
