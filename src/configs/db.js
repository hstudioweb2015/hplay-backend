import mariadb from 'mariadb';
import { database } from './config.js';

export function connectDB() {
	try {
		mariadb.createPool({
			host: database.host,
			port: database.port,
			user: database.user,
			password: database.password,
			database: database.name,
			connectionLimit: 5
		});
	} catch (error) {
		console.error('Error connecting to the database:', error);
		process.exit(1);
	}
}
