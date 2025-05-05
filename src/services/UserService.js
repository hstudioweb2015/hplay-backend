import User from "../models/User.js";
import DBService from "./DBService.js";
import DBError from "../errors/DBError.js";

export default class UserService {

	/**
	 * Creates a new user in the database
	 * @param data
	 * @returns {Promise<User>} The created user object.

	 */
	static async create({ firstName, lastName, email, password }) {
		try {
			const sql = `INSERT INTO users (firstName, lastName, email, password)
                   VALUES (?, ?, ?, ?)`;
			const params = [firstName, lastName, email, password];
			await DBService.query(sql, params);
			return new User(firstName, lastName, email);
		} catch (error) {
			if (error.code === "ER_DUP_ENTRY") {
				throw new DBError("email already exists", 409);
			}
			throw error;
		}
	}
}