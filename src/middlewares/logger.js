import * as fs from "node:fs";

export default function logger (req, res, next) {
	const start = Date.now();
	const { method, url } = req;
	res.on('finish', () => {
		const duration = Date.now() - start;
		const message = `${method} ${url} ${res.statusCode} - ${duration}ms`;
		console.log(message);
		fs.appendFile('server.log', message + '\n', (err) => {
			if (err) {
				console.error('Error writing to log file:', err);
			}
		});
	});
	next();
}