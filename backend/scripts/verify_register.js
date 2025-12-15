
const API_URL = 'http://localhost:3000/api';

async function verifyRegister() {
    const timestamp = Date.now();
    const userData = {
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@flowra.com`,
        password: 'password123',
        companyName: `Flowra Corp ${timestamp}`
    };

    console.log('1. Attempting to register user:', userData.email);

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('DEBUG: Full Response Data:', JSON.stringify(data, null, 2));

        if (response.status === 201) {
            console.log('✅ Registration SUCCESS');
            if (data.data && data.data.user) {
                console.log('   User ID:', data.data.user.id);
                console.log('   Token received:', !!data.data.token);
                return data.data;
            } else {
                console.error('❌ Data structure unexpected:', data);
            }
        } else {
            console.error('❌ Registration FAILED with status:', response.status);
            console.error('   Response:', data);
        }
    } catch (error) {
        console.error('❌ Registration FAILED (Network/System Error)');
        console.error('   Error:', error.cause || error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   Server is likely NOT RUNNING on port 3000');
        }
        process.exit(1);
    }
}

verifyRegister();
