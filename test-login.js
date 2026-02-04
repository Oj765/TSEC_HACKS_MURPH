// test-login.js
// Simple test script to verify login/signup functionality

const testSignup = async () => {
    console.log('\n🧪 Testing Signup...');
    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Student',
                email: 'test@example.com',
                password: 'password123',
                role: 'student'
            })
        });

        const data = await response.json();
        console.log('Signup Response:', response.status, data);
        return data;
    } catch (error) {
        console.error('Signup Error:', error.message);
    }
};

const testLogin = async () => {
    console.log('\n🧪 Testing Login...');
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                role: 'student'
            })
        });

        const data = await response.json();
        console.log('Login Response:', response.status, data);
        return data;
    } catch (error) {
        console.error('Login Error:', error.message);
    }
};

const testCORS = async () => {
    console.log('\n🧪 Testing CORS...');
    try {
        const response = await fetch('http://localhost:5000/api/health', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log('Health Check Response:', response.status, data);
    } catch (error) {
        console.error('CORS Error:', error.message);
    }
};

// Run tests
(async () => {
    console.log('🚀 Starting Login Page Tests...\n');

    await testCORS();
    await testSignup();
    await testLogin();

    console.log('\n✅ Tests completed!');
})();
