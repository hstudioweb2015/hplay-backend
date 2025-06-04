import jwt from 'jsonwebtoken';
import {jwtExpiration, jwtSecret} from "../configs/config.js";

export default class User {
	/**
	 * @constructor
	 * @description User model
	 * @param id {Integer} - User id
	 * @param firstName {String} - User first name
	 * @param lastName {String} - User last name
	 * @param email {String} - User email
	 * @param isAdmin {Boolean} - User is admin
	 * @param isContributor {Boolean} - User is contributor
	 */
	constructor(id, firstName, lastName, email, isAdmin = false, isContributor = false) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.isAdmin = isAdmin;
		this.isContributor = isContributor;
	}

	/**
	 * @description Generates a JWT token for the user
	 * @returns {{token: string, expire: number}}
	 */
	generateJWT() {
		return {
			token: jwt.sign(
					{
						id: this.id.toString(),
						email: this.email,
						isAdmin: this.isAdmin,
						isContributor: this.isContributor,
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