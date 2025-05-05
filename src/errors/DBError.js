import AppError from "./AppError.js";

export default class DBError extends AppError {
	constructor(messages, status = 500) {
		super("Database operation failed.");
		this.name = 'DBError';
		this.status = status;
		this.messages = messages;
	}
}