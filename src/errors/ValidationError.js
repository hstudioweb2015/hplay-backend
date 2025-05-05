export default class ValidationError extends Error {
	constructor(messages, status = 400) {
		super("Required fields are missing or invalid.");
		this.name = "ValidationError";
		this.status = status;
		this.messages = messages;
	}
}