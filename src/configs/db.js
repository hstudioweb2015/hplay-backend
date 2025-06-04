import mariadb from 'mariadb';
import { database } from './config.js';

let pool;

export function connectDB() {
	try {
		pool = mariadb.createPool({
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

export function getConnection() {
	if (!pool) throw new Error('Database connection pool is not initialized. Call connectDB() first.');
	return pool.getConnection();
}