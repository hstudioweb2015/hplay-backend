import {production} from "../configs/config.js";
import AppError from "../errors/AppError.js";

/**
 * Error handler middleware
 * @description This middleware handles errors thrown in the application
 * @param err
 * @param req
 * @param res
 * @param next
 */
export default function errorHandler(err, req, res, next) {
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