import dotenv from 'dotenv';

dotenv.config();
export const port = process.env.PORT || 3000;
export const database = {
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 3000,
	name: process.env.DB_NAME || 'HPlay',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
}
export const production =  process.env.PRODUCTION === 'true' || false;
export const jwtSecret = process.env.JWT_SECRET || '';
export const jwtExpiration = process.env.JWT_EXPIRATION || '12h';