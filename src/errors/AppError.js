export default class AppError extends Error {
	constructor(messages, status = 500) {
		super("An error occurred.");
		this.name = "AppError";
		this.status = status;
		this.messages = messages;
	}
}