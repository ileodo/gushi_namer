const http = require('http');
const fs = require('fs');
const path = require('path');
const mimetype = require('mimetype');

const server = http.createServer((req, res) => {
  const filePath = path.join(path.resolve(__dirname, '..'), 'dist', req.url === '/' ? 'index.html' : req.url);

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      const contentType = mimetype.lookup(filePath) || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});