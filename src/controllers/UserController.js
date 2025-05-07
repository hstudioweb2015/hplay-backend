import UserService from "../services/UserService.js";
import UserError from "../errors/UserError.js";

export default class UserController {
	/**
	 * Creates a new user
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	static async createUser(req, res, next) {
		try {
			let response = await UserService.create(req.body);
			response.user.id = response.user.id.toString();
			res.status(201).json(response);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Login a user
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	static async loginUser(req, res, next) {
		try {
			let response = await UserService.login(req.body);
			response.user.id = response.user.id.toString();
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get user by id
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	static async getUserById(req, res, next) {
		try {
			if (req.user.id !== req.body.id && !req.user.isAdmin) next(new UserError("Unauthorized", 401));
			let response = await UserService.getById(req.body);
			response.id = response.id.toString();
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update user
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	static async updateUser(req, res, next) {
		if (req.user.id !== req.body.id && !req.user.isAdmin) next(new UserError("Unauthorized", 401));
		try {
			let response = await UserService.update(req.body);
			response.id = response.id.toString();
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Delete user
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	static async deleteUser(req, res, next) {
		if (req.user.id !== req.body.id && !req.user.isAdmin) next(new UserError("Unauthorized", 401));
		try {
			let response = await UserService.delete(req.body);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}
}