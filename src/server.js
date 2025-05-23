import http from 'http';
import app from './app.js';
import {port} from './configs/config.js';
import {connectDB} from "./configs/db.js";

connectDB();

// Create server with extended timeout
const server = http.createServer(app);

server.timeouts = 60 * 60 * 1000; // 60 minutes
server.keepAliveTimeout = 60 * 60 * 1000; // 60 minutes
server.headersTimeout = 60 * 60 * 1000; // 60 minutes
server.requestTimeout = 60 * 60 * 1000; // 60 minutes surement celui la
server.on('timeout', (socket) => {
	console.log('Socket timeout');
	socket.end();
});

server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});