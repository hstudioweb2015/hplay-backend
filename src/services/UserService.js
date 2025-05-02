import User from "../models/User.js";

export default class UserService {

	/**
	 * Creates a new user in the database.
	 * @param user {User} The user object to be created.
	 * @returns {Promise<User>} The created user object.
	 */
	static async createUser(user) {
		return await User.create(user);
	}
}