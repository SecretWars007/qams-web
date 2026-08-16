const crypto = require('crypto');
const http = require('http');

const key = Buffer.from('12345678901234567890123456789012', 'utf8');
const iv = Buffer.from('1234567890123456', 'utf8');

const json = JSON.stringify({
    projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Test Plan ISTQB',
    startDate: '2026-08-01T00:00:00',
    endDate: '2026-08-10T00:00:00',
    criteria: [
        { criteriaType: 'ENTRY', description: 'desc', isMet: false, priority: 'HIGH', category: 'ENVIRONMENT' }
    ],
    milestones: [
        { name: 'm1', dueDate: '2026-08-06T00:00:00', isCompleted: false }
    ]
});

const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let encrypted = cipher.update(json, 'utf8', 'base64');
encrypted += cipher.final('base64');

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/TestPlans',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': encrypted.length
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', data);
    });
});

req.on('error', e => console.error(e));
req.write(encrypted);
req.end();
