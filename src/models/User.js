import jwt from 'jsonwebtoken';
import {jwtExpiration, jwtSecret} from "../configs/config.js";
export default class User {
	constructor(id, firstName, lastName, email, isAdmin = false) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.isAdmin = isAdmin;
	}

	generateJWT() {
		return {
			token: jwt.sign(
				{
					id: this.id.toString(),
					email: this.email,
					isAdmin: this.isAdmin
				},
				jwtSecret,
				{
					expiresIn: jwtExpiration,
					algorithm: 'HS256'
				}
			),
			expire: Math.floor(Date.now() / 1000) + (parseInt(jwtExpiration) * 60 * 60)
		};
	}
}