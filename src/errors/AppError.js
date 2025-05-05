export default class AppError extends Error {
	constructor(title = "An error occurred.", messages, status = 500) {
		super(title);
		this.name = "AppError";
		this.status = status;
		this.messages = messages;
	}
}