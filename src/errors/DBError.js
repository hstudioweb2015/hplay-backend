export default class DBError extends Error {
	constructor(messages, status = 500) {
		super("Database operation failed.");
		this.name = 'DBError';
		this.status = status;
		this.messages = messages;
	}
}