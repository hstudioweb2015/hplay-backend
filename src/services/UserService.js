import User from "../models/User.js";
import DBService from "./DBService.js";
import UserError from "../errors/UserError.js";

export default class UserService {

	/**
	 * Creates a new user
	 * @param firstName {String} - User first name
	 * @param lastName {String} - User last name
	 * @param email {String} - User email
	 * @param password {String} - User password
	 * @returns {Promise<{jwtToken: {token: string, expire: number}, user: User}>}
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

	/**
	 * Login a user
	 * @param email {String} - User email
	 * @param password {String} - User password
	 * @returns {Promise<{jwtToken: {token: string, expire: number}, user: User}>}
	 */
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

	/**
	 * Get user by id
	 * @param id {Integer} - User id
	 * @returns {Promise<User>}
	 */
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

	/**
	 * Update user
	 * @param id {Integer} - User id
	 * @param firstName {String} - User first name
	 * @param lastName {String} - User last name
	 * @param email {String} - User email
	 * @param password {String} - User password
	 * @returns {Promise<User>}
	 */
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

	/**
	 * Delete user
	 * @param id {Integer} - User id
	 * @returns {Promise<{message: string}>}
	 */
	static async delete({id}) {
		await UserService.userExist(id);
		const sql = `DELETE
                 FROM users
                 WHERE id = ?`;
		const params = [id];
		await DBService.query(sql, params);
		return {message: "User deleted"};
	}

	/**
	 * Check if user exists
	 * @param id {Integer} - User id
	 * @returns {Promise<boolean>}
	 */
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