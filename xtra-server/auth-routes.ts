import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// Type for User with BusinessProfile included
type UserWithBusinessProfile = Prisma.UserGetPayload<{
    include: { businessProfile: true }
}>

export default async function authRoutes(fastify: FastifyInstance) {

    // Signup
    fastify.post('/auth/signup', async (request, reply) => {
        const { email, password, displayName } = request.body as any

        if (!email || !password) {
            return reply.code(400).send({ error: 'Email and password are required' })
        }

        try {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({ where: { email } })
            if (existingUser) {
                return reply.code(400).send({ error: 'User already exists' })
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10)

            // Create user and business profile
            const user: UserWithBusinessProfile = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    displayName: displayName || email.split('@')[0],
                    businessProfile: {
                        create: {},
                    },
                },
                include: {
                    businessProfile: true,
                },
            })

            // Generate JWT
            const token = fastify.jwt.sign({
                userId: user.id,
                email: user.email,
                businessProfileId: user.businessProfile?.id
            })

            return { token, user: { id: user.id, email: user.email, displayName: user.displayName } }

        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Internal Server Error' })
        }
    })

    // Login
    fastify.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body as any

        if (!email || !password) {
            return reply.code(400).send({ error: 'Email and password are required' })
        }

        try {
            const user: UserWithBusinessProfile | null = await prisma.user.findUnique({
                where: { email },
                include: { businessProfile: true }
            })

            if (!user) {
                return reply.code(401).send({ error: 'Invalid credentials' })
            }

            const validPassword = await bcrypt.compare(password, user.passwordHash)
            if (!validPassword) {
                return reply.code(401).send({ error: 'Invalid credentials' })
            }

            const token = fastify.jwt.sign({
                userId: user.id,
                email: user.email,
                businessProfileId: user.businessProfile?.id
            })

            return { token, user: { id: user.id, email: user.email, displayName: user.displayName } }

        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Internal Server Error' })
        }
    })

    // Me (Protected)
    fastify.get('/auth/me', {
        onRequest: [async (request, reply) => {
            try {
                await request.jwtVerify()
            } catch (err) {
                reply.send(err)
            }
        }]
    }, async (request, reply) => {
        try {
            const jwtUser = request.user as { userId: string }

            const user = await prisma.user.findUnique({
                where: { id: jwtUser.userId },
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    businessProfile: {
                        select: {
                            id: true
                        }
                    }
                }
            })

            if (!user) {
                return reply.code(404).send({ error: 'User not found' })
            }

            const responseUser = {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                businessProfileId: user.businessProfile?.id
            }

            return responseUser

        } catch (error) {
            request.log.error(error)
            return reply.code(500).send({ error: 'Internal Server Error' })
        }
    })
}
