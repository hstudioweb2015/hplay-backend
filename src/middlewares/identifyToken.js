import jwt from "jsonwebtoken";
import {jwtSecret} from "../configs/config.js";

export default function identifyToken(req, res, next) {
	const authHeader = req.headers["authorization"] || req.headers["Authorization"];
	if (authHeader == null) return next();
	let token = null;
	if (authHeader.includes("Bearer")) {
		token = authHeader && authHeader.split(" ")[1];
	} else {
		token = authHeader;
	}
	jwt.verify(token, jwtSecret, (err, user) => {
		if (err) return next();
		req.user = user;
		next();
	})
}