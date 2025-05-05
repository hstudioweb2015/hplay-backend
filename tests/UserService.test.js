import UserService from '../src/services/UserService';
import DBService from "../src/services/DBService.js";
import {connectDB} from "../src/configs/db.js";

function createUser() {
	return {
		firstName: 'John',
		lastName: 'Doe',
		email: 'test@test.test',
		password: '123456'
	};
}

beforeEach(async () => {
	await connectDB();
	await DBService.query('DELETE FROM users WHERE email = ?', ['test@test.test'])
})

afterEach(async () => {
	await DBService.query('DELETE FROM users WHERE email = ?', ['test@test.test'])
})
describe('User Service', () => {
	it('should create a user', async () => {
		// Given
		const user = createUser();

		// When
		const response = await UserService.create(user);

		// Then
		expect(response).toHaveProperty('jwtToken');
		expect(response.user).toHaveProperty('id');
		expect(response.user).toHaveProperty('firstName', user.firstName);
		expect(response.user).toHaveProperty('lastName', user.lastName);
		expect(response.user).toHaveProperty('email', user.email);
	});

	it('should not create a user with an existing email', async () => {
		// Given
		const user = createUser();
		await UserService.create(user);

		// When
		const response = UserService.create(user);

		// Then
		await expect(response).rejects.toThrow('User operation failed.');
		await expect(response).rejects.toHaveProperty('status', 409);
		await expect(response).rejects.toHaveProperty('messages', 'email already exists');
	});

	it('should login a user', async () => {
		// Given
		const user = createUser();
		await UserService.create(user);

		// When
		const response = await UserService.login(user);

		// Then
		expect(response).toHaveProperty('jwtToken');
		expect(response.user).toHaveProperty('id');
		expect(response.user).toHaveProperty('firstName', user.firstName);
		expect(response.user).toHaveProperty('lastName', user.lastName);
		expect(response.user).toHaveProperty('email', user.email);
	});

	it('should not login a user with wrong password', async () => {
		// Given
		const user = createUser();
		await UserService.create(user);
		user.password = 'wrongpassword';

		// When
		const response = UserService.login(user);

		// Then
		await expect(response).rejects.toThrow('User operation failed.');
		await expect(response).rejects.toHaveProperty('status', 401);
		await expect(response).rejects.toHaveProperty('messages', 'Invalid email or password');
	});

	it('should not login a user with non-existing email', async () => {
		// Given
		const user = createUser();
		await UserService.create(user);
		user.email = 'nonexisting@test.test';

		// When
		const response = UserService.login(user);

		// Then
		await expect(response).rejects.toThrow('User operation failed.');
		await expect(response).rejects.toHaveProperty('status', 401);
		await expect(response).rejects.toHaveProperty('messages', 'Invalid email or password');
	});

	it('should update a user', async () => {
		// Given
		const user = createUser();
		const createdUser = (await UserService.create(user)).user;

		// When
		const updatedUser = createdUser;
		updatedUser.firstName = 'Jane';
		const response = await UserService.update(updatedUser);

		// Then
		expect(response).toHaveProperty('id', createdUser.id);
		expect(response).toHaveProperty('firstName', updatedUser.firstName);
		expect(response).toHaveProperty('lastName', createdUser.lastName);
		expect(response).toHaveProperty('email', createdUser.email);
	});
});