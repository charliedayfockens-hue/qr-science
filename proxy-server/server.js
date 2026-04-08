const { createBareServer } = require('@tomphttp/bare-server-node');
const express = require('express');
const { join } = require('path');
const { createServer } = require('http');

const app = express();
const bare = createBareServer('/bare/');

// Serve our public files first — this lets uv.config.js override the package default
app.use(express.static(join(__dirname, 'public')));

// Serve UV dist files (bundle, sw, handler, client) from the npm package
const uvDist = join(__dirname, 'node_modules', '@titaniumnetwork-dev', 'ultraviolet', 'dist');
app.use('/uv/', express.static(uvDist));

// Catch-all — serve index.html for any unmatched route
app.get('*', (req, res) => res.sendFile(join(__dirname, 'public', 'index.html')));

const server = createServer();

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.destroy();
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
