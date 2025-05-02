export default class User {
	constructor(firstName, lastName, email, password, isAdmin = false) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.password = password;
		this.isAdmin = isAdmin;
	}

	static create(user) {
		return Promise.resolve(undefined);
	}
}