import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testAuth() {
    try {
        console.log('--- Testing Signup ---');
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        try {
            const signupRes = await axios.post(`${API_URL}/auth/signup`, {
                email,
                password,
                displayName: 'Test User'
            });
            console.log('Signup Success:', signupRes.data);
        } catch (e: any) {
            console.error('Signup Failed:', e.response?.data || e.message);
        }

        console.log('\n--- Testing Login ---');
        let token = '';
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            console.log('Login Success:', loginRes.data);
            token = loginRes.data.token;
        } catch (e: any) {
            console.error('Login Failed:', e.response?.data || e.message);
        }

        if (token) {
            console.log('\n--- Testing Protected Route ---');
            try {
                const meRes = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Me Endpoint Success:', meRes.data);
            } catch (e: any) {
                console.error('Me Endpoint Failed:', e.response?.data || e.message);
            }
        }

    } catch (error: any) {
        console.error('Unexpected Error:', error.message);
    }
}

testAuth();
