import User from "../models/User.js";
import DBService from "./DBService.js";
import UserError from "../errors/UserError.js";
import MailerService from "./MailerService.js";
import {sha256} from "js-sha256";

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

	static async search({query}) {
		const sql = `SELECT id, firstName, lastName, email, is_admin as isAdmin
                 FROM users
                 WHERE firstName LIKE ?
                    OR lastName LIKE ?
                    OR email LIKE ?
                 ORDER BY firstName, lastName LIMIT 30`;
		const params = [`%${query}%`, `%${query}%`, `%${query}%`];
		const result = await DBService.query(sql, params);
		if (result.length === 0) {
			return [];
		}
		return result.map(user => new User(user.id, user.firstName, user.lastName, user.email, user.isAdmin));
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

	static async resetPassword({id}) {
		const user = await UserService.getById({id});
		//generate a random password
		const password = Math.random().toString(36).slice(-12);
		const sql = `UPDATE users
                 SET password = ?
                 WHERE id = ?`;
		const params = [sha256(password), id];
		await DBService.query(sql, params);
		const mailer = new MailerService();
		await mailer.sendMail(
				user.email,
				"Password reset",
				`Hello ${user.firstName} ${user.lastName},\n\nYour password has been reset. Your new password is: ${password}` +
				`\nPlease change it as soon as possible.` +
				`\nIf you did not request this change, please contact us immediately.` +
				`\n\nThank you for using HPlay!` +
				`\nIf you have any questions, feel free to contact us at` +
				`\n\nBest regards,` +
				`\nThe HPlay team`
		);
		return {message: "Password reset"};
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