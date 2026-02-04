const http = require('http');

console.log('Testing GET /api/sessions...');

http.get('http://localhost:5000/api/sessions', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let chunks = '';
    res.on('data', (d) => { chunks += d; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(chunks);
            console.log('Sessions found:', parsed.length);
            console.log(JSON.stringify(parsed[0] || 'No sessions', null, 2));
        } catch (e) {
            console.log('Response:', chunks);
        }
    });
}).on('error', (e) => {
    console.error('Error:', e.message);
});
