import jwt from "jsonwebtoken";
import {jwtSecret} from "../configs/config.js";
import UserError from "../errors/UserError.js";

export default function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) next(new UserError("No token provided", 401));
	jwt.verify(token, jwtSecret, (err, user) => {
		if (err) next(new UserError("Unauthorized", 401));
		req.user = user;
		next();
	});
}