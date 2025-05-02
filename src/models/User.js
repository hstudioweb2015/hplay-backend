export default class User {
	constructor(firstName, lastName, email, isAdmin = false) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.isAdmin = isAdmin;
	}

	static async create(user) {
		return new Promise((resolve, reject) => {
			// Simulate database operation
			setTimeout(() => {
				user.password = undefined;
				resolve(user);
			}, 1000);
		});
	}
}