const http = require('http');

console.log('Testing Create Session API...');

const data = JSON.stringify({
    teacherId: 'tea_test123',
    topic: 'Test Physics Session',
    date: '2026-05-20',
    time: '14:00',
    duration: 45,
    ratePerMinute: 2.5,
    description: 'Test session created via script',
    languages: ['English']
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/sessions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let chunks = '';
    res.on('data', (d) => { chunks += d; });
    res.on('end', () => {
        console.log('--- Response Body ---');
        try {
            const parsed = JSON.parse(chunks);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log(chunks);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error connecting to server:', error.message);
    console.log('HINT: Is the server running on port 5000? You might need to restart it if you just changed server.js');
});

req.write(data);
req.end();
