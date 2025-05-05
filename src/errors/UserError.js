export default class UserError extends Error {
	constructor(messages, status = 400) {
		super("User operation failed.");
		this.name = 'UserError';
		this.status = status;
		this.messages = messages;
	}
}