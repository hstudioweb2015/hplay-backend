import {production} from "../configs/config.js";
export default function errorHandler(err, req, res, next) {
	console.log(production);
	if (!production) {
		console.error(err);
	}
	res.status(err.status || 500).json({
		error: err.name || "Error",
		message: err.message || "Internal Server Error",
		details: err.messages || null,
	});
}