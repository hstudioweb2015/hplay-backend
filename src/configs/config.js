import dotenv from 'dotenv';

dotenv.config();
export const appName = process.env.APP_NAME || 'HPlay';
export const port = process.env.PORT || 3000;
export const database = {
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 3000,
	name: process.env.DB_NAME || 'HPlay',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
}
export const production = process.env.PRODUCTION === 'true' || false;
export const jwtSecret = process.env.JWT_SECRET || '';
export const jwtExpiration = process.env.JWT_EXPIRATION || '12h';
export const infomaniak = {
	channelId: process.env.INFOMANIAK_CHANNEL_ID || '',
	apiKey: process.env.INFOMANIAK_API_KEY || '',
	allowedDomain: process.env.INFOMANIAK_ALLOWED_DOMAIN || null,
	tokenDuration: process.env.INFOMANIAK_TOKEN_DURATION || 30,
	folderId: process.env.INFOMANIAK_FOLDER_ID || '',
	playerId: process.env.INFOMANIAK_PLAYER_ID || '',
}
export const corsOrigin = process.env.CORS_ORIGIN || '*';

export const zahls = {
	instanceId: process.env.ZAHLS_INSTANCE_ID || '',
	apiKey: process.env.ZAHLS_API_KEY || '',
	tva: process.env.ZAHLS_TVA || 0,
}

export const mailer = {
	host: process.env.MAIL_HOST || 'localhost',
	port: process.env.MAIL_PORT || 25,
	secure: process.env.MAIL_SECURE === 'true' || false,
	user: process.env.MAIL_USER || '',
	password: process.env.MAIL_PASSWORD || '',
	from: process.env.MAIL_FROM || 'no-reply@localhost',
}

export const uploadMaxBufferSize = process.env.UPLOAD_MAX_BUFFER_SIZE * 1024 * 1024 || 100 * 1024 * 1024; // 100 MB