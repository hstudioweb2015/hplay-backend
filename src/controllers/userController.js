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
			const user = await UserService.create(req.body);
			res.status(201).json(user);
		} catch (error) {
			next(error);
		}
	}
}