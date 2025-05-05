export default class User {
	constructor(id, firstName, lastName, email, isAdmin = false) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.isAdmin = isAdmin;
	}
}