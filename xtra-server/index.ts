import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import * as dotenv from 'dotenv'
import authRoutes from './auth-routes.js'
import canvaAuthRoutes from './canva-auth.js'

dotenv.config()

const fastify = Fastify({
    logger: true
})

await fastify.register(cors, {
    origin: true // Allow all origins for development
})

// Register JWT
fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret' // Use env var in production
})

// Register Routes
fastify.register(authRoutes)
fastify.register(canvaAuthRoutes)

fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
})

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000')
        await fastify.listen({ port, host: '0.0.0.0' })
        console.log(`Server listening on http://localhost:${port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()
