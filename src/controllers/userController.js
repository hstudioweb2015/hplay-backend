import UserService from "../services/UserService.js";

export default class UserController {
	/**
	 * Creates a new user.
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

	static async loginUser(req, res, next) {
		try {
			let response = await UserService.login(req.body);
			response.user.id = response.user.id.toString();
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}

	static async updateUser(req, res, next) {
		await UserService.updateAuthorizationCheck(req.params.id, req.user);
		try {
			let response = await UserService.update(req.body);
			response.id = response.id.toString();
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}
}