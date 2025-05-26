import UserError from "../errors/UserError.js";
import jwt from "jsonwebtoken";
import {jwtSecret} from "../configs/config.js";

export default function authenticateTokenIfExist(req, res, next) {
	const authHeader = req.headers["authorization"] || req.headers["Authorization"];
	if (authHeader == null) next();
	let token = null;
	if (authHeader.includes("Bearer")) {
		token = authHeader && authHeader.split(" ")[1];
	} else {
		token = authHeader;
	}
	jwt.verify(token, jwtSecret, (err, user) => {
		if (err) next(new UserError("Unauthorized", 401));
		req.user = user;
		next();
	});
}