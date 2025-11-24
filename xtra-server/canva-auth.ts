import { type FastifyInstance } from 'fastify'
import crypto from 'crypto'
import axios from 'axios'
import * as dotenv from 'dotenv'

dotenv.config()

// In-memory storage for code_verifiers (DO NOT USE IN PRODUCTION)
const stateStore = new Map<string, string>()

const CLIENT_ID = process.env.CANVA_CLIENT_ID
const CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET
const REDIRECT_URI = process.env.CANVA_REDIRECT_URI

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Missing environment variables in canva-auth.ts')
}

// Helper to generate PKCE values
const generatePkce = () => {
    const codeVerifier = crypto.randomBytes(96).toString('base64url')
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url')
    const state = crypto.randomBytes(96).toString('base64url')
    return { codeVerifier, codeChallenge, state }
}

export default async function canvaAuthRoutes(fastify: FastifyInstance) {

    // Route to get the Authorization URL
    fastify.get('/auth/canva/url', async (request, reply) => {
        const { codeVerifier, codeChallenge, state } = generatePkce()

        // Store the code_verifier associated with the state
        stateStore.set(state, codeVerifier)

        // Scopes provided by user
        const scopes = [
            'design:meta:read',
            'asset:write',
            'design:content:read',
            'asset:read',
            'brandtemplate:meta:read',
            'design:content:write',
            'brandtemplate:content:read',
            'profile:read'
        ]
        const scopeString = scopes.join(' ')

        const authUrl = new URL('https://www.canva.com/api/oauth/authorize')
        authUrl.searchParams.append('code_challenge_method', 's256')
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('client_id', CLIENT_ID!)
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI!)
        authUrl.searchParams.append('scope', scopeString)
        authUrl.searchParams.append('code_challenge', codeChallenge)
        authUrl.searchParams.append('state', state)

        return { url: authUrl.toString() }
    })

    // Callback route
    fastify.get('/oauth/redirect', async (request, reply) => {
        const { code, state, error } = request.query as { code?: string, state?: string, error?: string }

        if (error) {
            return reply.status(400).send({ error: `Canva error: ${error}` })
        }

        if (!code || !state) {
            return reply.status(400).send({ error: 'Missing code or state' })
        }

        const codeVerifier = stateStore.get(state)
        if (!codeVerifier) {
            return reply.status(400).send({ error: 'Invalid state or session expired' })
        }

        // Clean up used state
        stateStore.delete(state)

        try {
            const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

            const response = await axios.post('https://api.canva.com/rest/v1/oauth/token',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code_verifier: codeVerifier,
                    code: code,
                    redirect_uri: REDIRECT_URI!
                }),
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )

            return {
                message: 'Authentication successful!',
                tokens: response.data
            }

        } catch (err: any) {
            request.log.error(err)
            return reply.status(500).send({
                error: 'Failed to exchange token',
                details: err.response?.data || err.message
            })
        }
    })

    // Route to refresh the access token
    fastify.post('/auth/canva/refresh', async (request, reply) => {
        const { refresh_token } = request.body as { refresh_token: string }

        if (!refresh_token) {
            return reply.status(400).send({ error: 'Missing refresh_token' })
        }

        try {
            const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

            const response = await axios.post('https://api.canva.com/rest/v1/oauth/token',
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token
                }),
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )

            return {
                message: 'Token refreshed successfully!',
                tokens: response.data
            }

        } catch (err: any) {
            request.log.error(err)
            return reply.status(500).send({
                error: 'Failed to refresh token',
                details: err.response?.data || err.message
            })
        }
    })
}
