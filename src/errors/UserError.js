import AppError from "./AppError.js";

export default class UserError extends AppError {
	constructor(messages, status = 400) {
		super("User operation failed.", messages, status);
		this.name = 'UserError';
	}
}