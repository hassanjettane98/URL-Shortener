const http = require('http');
const fs = require('fs');
const shortid = require('shortid');

const PORT = process.env.PORT || 3000;

const urlMapping = {};

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Serve HTML file
        fs.readFile('public/index.html', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.method === 'POST' && req.url === '/shorten') {
        // Handle URL shortening
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            const originalUrl = new URLSearchParams(body).get('original_url');

            if (originalUrl) {
                const shortUrl = shortid.generate();
                urlMapping[shortUrl] = originalUrl;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ shortUrl }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid URL' }));
            }
        });
    } else if (req.method === 'GET' && req.url.startsWith('/')) {
        // Redirect to original URL
        const shortUrl = req.url.slice(1);
        const originalUrl = urlMapping[shortUrl];

        if (originalUrl) {
            res.writeHead(302, { 'Location': originalUrl });
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('URL not found');
        }
    } else {
        // Handle other requests
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
