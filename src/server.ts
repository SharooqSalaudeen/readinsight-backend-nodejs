import dotenv from 'dotenv'
const result = dotenv.config()
if (result.error) {
    dotenv.config({ path: '.env' })
}
import { logger } from './utils/logger'
import MongoConnection from './utils/mongo-connection'
import { config } from './config/config'
import generateNews from './utils/generateNews'

const mongoConnection = new MongoConnection(config.mongodb_uri ?? '')

// Connect to MongoDB
if (config.mongodb_uri == null) {
    logger.log({
        level: 'error',
        message: 'MONGO_URL not specified in environment',
    })
    process.exit(1)
} else {
    mongoConnection.connect(() => {
        generateNews()
    })
}

// Close the Mongoose connection, when receiving SIGINT
process.on('SIGINT', () => {
    logger.info('Gracefully shutting down')
    mongoConnection.close()
})
