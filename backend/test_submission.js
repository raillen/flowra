import http from 'http';

const token = 'e5452691bd4c16109190a962acefb938b96162618569eadaedf0d384002ba1cf';
const data = JSON.stringify({ data: { field_1: "Test" } });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/briefing/public/${token}/submit`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
