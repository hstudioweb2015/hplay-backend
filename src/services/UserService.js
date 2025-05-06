import User from "../models/User.js";
import DBService from "./DBService.js";
import UserError from "../errors/UserError.js";

export default class UserService {

	/**
	 * Creates a new user in the database
	 * @param data
	 * @returns {Promise<{jwtToken: (*), user: User}>} The created user object.

	 */
	static async create({firstName, lastName, email, password}) {
		try {
			const sql = `INSERT INTO users (firstName, lastName, email, password)
                   VALUES (?, ?, ?, ?)`;
			const params = [firstName, lastName, email, password];
			const id = await DBService.query(sql, params, true);
			const user = new User(id, firstName, lastName, email);
			const jwtToken = user.generateJWT();
			return {
				"jwtToken": jwtToken,
				"user": user
			};
		} catch (error) {
			if (error.code === "ER_DUP_ENTRY") {
				throw new UserError("email already exists", 409);
			}
			throw error;
		}
	}

	static async login({email, password}) {
		const sql = `SELECT id, firstName, lastName, email, is_admin as isAdmin
                 FROM users
                 WHERE email = ?
                   AND password = ?`;
		const params = [email, password];
		const result = await DBService.query(sql, params);
		if (result.length === 0) {
			throw new UserError("Invalid email or password", 401);
		}
		const {id, firstName, lastName, isAdmin} = result[0];
		const user = new User(id, firstName, lastName, email, isAdmin);
		const jwtToken = user.generateJWT();
		return {
			"jwtToken": jwtToken,
			"user": user
		};
	}
	
	static async getById({id}) {
		const sql = `SELECT id, firstName, lastName, email, is_admin as isAdmin
								 FROM users
								 WHERE id = ?`;
		const params = [id];
		const result = await DBService.query(sql, params);
		if (result.length === 0) {
			throw new UserError("User does not exist", 401);
		}
		const {firstName, lastName, email, isAdmin} = result[0];
		return new User(id, firstName, lastName, email, isAdmin);
	}

	static async update({id, firstName, lastName, email, password = null}) {
		await UserService.userExist(id);
		try {
			const sql = `UPDATE users
                   SET firstName = ?,
                       lastName  = ?,
                       email     = ? ${password ? ', password = ?' : ''}
                   WHERE id = ?`;
			const params = [firstName, lastName, email];
			if (password) {
				params.push(password);
			}
			params.push(id);
			await DBService.query(sql, params);
			return new User(id, firstName, lastName, email);
		} catch (error) {
			if (error.code === "ER_DUP_ENTRY") {
				throw new UserError("email already exists", 409);
			}
			throw error;
		}
	}
	
	static async delete({id}) {
		await UserService.userExist(id);
		const sql = `DELETE FROM users
								 WHERE id = ?`;
		const params = [id];
		await DBService.query(sql, params);
		return {message: "User deleted"};
	}

	static async userExist(id) {
		const sql = `SELECT id
                 FROM users
                 WHERE id = ?`;
		const params = [id];
		const result = await DBService.query(sql, params);
		if (result.length === 0) {
			throw new UserError("User does not exist", 401);
		}
		return true;
	}
}