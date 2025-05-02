import User from '../models/User.js';
import UserService from "../services/userService.js";

export default class UserController {

	/**
	 * Creates a new user.
	 * @param req
	 * @param res
	 * @returns {Promise<void>}
	 */
	static async createUser(req, res) {
			const {firstName, lastName, email, password} = req.body;
			const newUser = new User(firstName, lastName, email, password);
			const user = await UserService.createUser(newUser);
			res.status(201).json(user);
	}
}