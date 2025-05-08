import AppError from "./AppError.js";

export default class TagError extends AppError {
	constructor(messages, status = 400) {
		super("Tag operation failed.", messages, status);
		this.name = "TagError";
	}
}