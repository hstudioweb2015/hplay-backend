import {production} from "../configs/config.js";
import AppError from "../errors/AppError.js";

export default function errorHandler(err, req, res, next) {
	console.log(production);
	if (!production) {
		console.error(err);
	}
	if (!(err instanceof AppError)) {
		err = new AppError("An unexpected error occurred", 500);
	}
	res.status(err.status || 500).json({
		error: err.name || "Error",
		message: err.message || "Internal Server Error",
		details: err.messages || null,
	});
}