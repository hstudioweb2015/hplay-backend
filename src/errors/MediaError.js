import AppError from "./AppError.js";

export default class MediaError extends AppError {
	constructor(messages, status = 400) {
		super("Media operation failed.", messages, status);
		this.name = "MediaError";
	}
}