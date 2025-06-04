import AppError from "./AppError.js";

export default class DBError extends AppError {
	constructor(messages, status = 500) {
		super("Database operation failed.", messages, status);
		this.name = 'DBError';
	}
}