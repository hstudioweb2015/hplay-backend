import UserService from '../src/services/UserService';
import DBService from "../src/services/DBService.js";
import MailerService from "../src/services/MailerService.js";
import {sha256} from "js-sha256";
import UserError from "../src/errors/UserError.js";

// Mock DBService
jest.mock("../src/services/DBService.js", () => ({
	query: jest.fn()
}));

// Mock MailerService
jest.mock("../src/services/MailerService.js", () => {
	// Create a spy for sendMail that we can track
	const sendMailMock = jest.fn().mockResolvedValue(true);

	// Create the mock constructor that will be returned when "new MailerService()" is called
	const MockMailerService = jest.fn().mockImplementation(() => {
		return {
			sendMail: sendMailMock
		};
	});

	// Track the sendMail mock on the constructor for easier testing
	MockMailerService.sendMailMock = sendMailMock;

	return MockMailerService;
});

function createUser() {
	return {
		firstName: 'John',
		lastName: 'Doe',
		email: 'test@test.test',
		password: '123456'
	};
}

// Clear all mocks before each test
beforeEach(() => {
	jest.clearAllMocks();
});

describe('User Service', () => {
	it('should create a new user', async () => {
		// Given
		const user = createUser();
		DBService.query.mockResolvedValueOnce(1); // Mock insert ID return

		// When
		const result = await UserService.create(user);

		// Then
		expect(result).toHaveProperty('jwtToken');
		expect(result).toHaveProperty('user');
		expect(result.user).toHaveProperty('id', 1);
		expect(result.user).toHaveProperty('firstName', user.firstName);
		expect(result.user).toHaveProperty('lastName', user.lastName);
		expect(result.user).toHaveProperty('email', user.email);
		expect(DBService.query).toHaveBeenCalledWith(
				expect.stringContaining('INSERT INTO users'),
				[user.firstName, user.lastName, user.email, user.password],
				true
		);
	});

	it('should throw error if email already exists', async () => {
		// Given
		const user = createUser();
		DBService.query.mockRejectedValueOnce({code: 'ER_DUP_ENTRY'});

		// When
		const createPromise = UserService.create(user);

		// Then
		await expect(createPromise).rejects.toThrow('User operation failed.');
		await expect(createPromise).rejects.toHaveProperty('status', 409);
		await expect(createPromise).rejects.toHaveProperty('messages', 'email already exists');
	});

	it('should login a user', async () => {
		// Given
		const user = createUser();
		DBService.query.mockResolvedValueOnce([{
			id: 1,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: 0
		}]);

		// When
		const result = await UserService.login(user);

		// Then
		expect(result).toHaveProperty('jwtToken');
		expect(result).toHaveProperty('user');
		expect(result.user).toHaveProperty('id', 1);
		expect(result.user).toHaveProperty('firstName', user.firstName);
		expect(result.user).toHaveProperty('lastName', user.lastName);
		expect(result.user).toHaveProperty('email', user.email);
		expect(DBService.query).toHaveBeenCalledWith(
				expect.stringContaining('SELECT id, firstName, lastName'),
				[user.email, user.password]
		);
	});

	it('should throw error if login credentials are invalid', async () => {
		// Given
		const user = createUser();
		DBService.query.mockResolvedValueOnce([]);

		// When
		const loginPromise = UserService.login(user);

		// Then
		await expect(loginPromise).rejects.toThrow('User operation failed.');
		await expect(loginPromise).rejects.toHaveProperty('status', 401);
		await expect(loginPromise).rejects.toHaveProperty('messages', 'Invalid email or password');
	});

	it('should search for users', async () => {
		// Given
		const user = createUser();
		DBService.query.mockResolvedValueOnce([{
			id: 1,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: 0
		}]);
		const query = 'John';

		// When
		const results = await UserService.search({query});

		// Then
		expect(Array.isArray(results)).toBeTruthy();
		expect(results.length).toBe(1);
		expect(results[0]).toHaveProperty('firstName', user.firstName);
		expect(DBService.query).toHaveBeenCalledWith(
				expect.stringContaining('WHERE firstName LIKE ?'),
				[`%${query}%`, `%${query}%`, `%${query}%`]
		);
	});

	it('should return empty array if no users match search', async () => {
		// Given
		const query = 'NonExistentUserXYZ';
		DBService.query.mockResolvedValueOnce([]);

		// When
		const results = await UserService.search({query});

		// Then
		expect(Array.isArray(results)).toBeTruthy();
		expect(results.length).toBe(0);
	});

	it('should get a user by id', async () => {
		// Given
		const user = createUser();
		DBService.query.mockResolvedValueOnce([{
			id: 1,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: 0
		}]);

		// When
		const retrievedUser = await UserService.getById({id: 1});

		// Then
		expect(retrievedUser).toHaveProperty('id', 1);
		expect(retrievedUser).toHaveProperty('firstName', user.firstName);
		expect(retrievedUser).toHaveProperty('lastName', user.lastName);
		expect(retrievedUser).toHaveProperty('email', user.email);
		expect(DBService.query).toHaveBeenCalledWith(
				expect.stringContaining('WHERE id = ?'),
				[1]
		);
	});

	it('should throw error when getting non-existent user by id', async () => {
		// Given
		const nonExistentId = 9999;
		DBService.query.mockResolvedValueOnce([]);

		// When
		const response = UserService.getById({id: nonExistentId});

		// Then
		await expect(response).rejects.toThrow('User operation failed.');
		await expect(response).rejects.toHaveProperty('status', 401);
		await expect(response).rejects.toHaveProperty('messages', 'User does not exist');
	});

	it('should update a user', async () => {
		// Given
		const user = createUser();
		const userId = 1;

		// Mock userExist check
		DBService.query.mockResolvedValueOnce([{id: userId}]);
		// Mock update
		DBService.query.mockResolvedValueOnce({affectedRows: 1});

		// When
		const result = await UserService.update({
			id: userId,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email
		});

		// Then
		expect(result).toHaveProperty('id', userId);
		expect(result).toHaveProperty('firstName', user.firstName);
		expect(result).toHaveProperty('lastName', user.lastName);
		expect(result).toHaveProperty('email', user.email);
		expect(DBService.query).toHaveBeenCalledTimes(2);
	});

	it('should update a user with password', async () => {
		// Given
		const user = createUser();
		const userId = 1;

		// Mock userExist check
		DBService.query.mockResolvedValueOnce([{id: userId}]);
		// Mock update
		DBService.query.mockResolvedValueOnce({affectedRows: 1});

		// When
		const result = await UserService.update({
			id: userId,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			password: 'newPassword'
		});

		// Then
		expect(result).toHaveProperty('id', userId);
		expect(DBService.query).toHaveBeenCalledTimes(2);
		// Verify password parameter was included
		const lastCallParams = DBService.query.mock.calls[1][1];
		expect(lastCallParams).toContain('newPassword');
	});

	it('should reset a user password', async () => {
		// Given
		const userId = 1;
		const user = createUser();

		// Mock getById
		DBService.query.mockResolvedValueOnce([{
			id: userId,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: 0
		}]);
		// Mock update
		DBService.query.mockResolvedValueOnce({affectedRows: 1});

		jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

		// When
		const response = await UserService.resetPassword({id: userId});

		// Then
		expect(response).toHaveProperty('message', 'Password reset');
		expect(DBService.query).toHaveBeenCalledTimes(2);

		// Get access to the sendMail mock function
		expect(MailerService.sendMailMock).toHaveBeenCalled();

		// Restore Math.random
		global.Math.random.mockRestore();
	});

	it('should delete a user', async () => {
		// Given
		const userId = 1;

		// Mock userExist check
		DBService.query.mockResolvedValueOnce([{id: userId}]);
		// Mock delete
		DBService.query.mockResolvedValueOnce({affectedRows: 1});

		// When
		const response = await UserService.delete({id: userId});

		// Then
		expect(response).toHaveProperty('message', 'User deleted');
		expect(DBService.query).toHaveBeenCalledTimes(2);

		// Use a regular expression to match the query regardless of whitespace
		expect(DBService.query).toHaveBeenNthCalledWith(2,
				expect.stringMatching(/DELETE.*FROM users.*WHERE id = \?/s),
				[userId]
		);
	});

	it('should verify if a user exists', async () => {
		// Given
		const userId = 1;
		DBService.query.mockResolvedValueOnce([{id: userId}]);

		// When
		const exists = await UserService.userExist(userId);

		// Then
		expect(exists).toBe(true);
		expect(DBService.query).toHaveBeenCalledWith(
				expect.stringContaining('WHERE id = ?'),
				[userId]
		);
	});

	it('should throw error when checking non-existent user', async () => {
		// Given
		const nonExistentId = 9999;
		DBService.query.mockResolvedValueOnce([]);

		// When
		const response = UserService.userExist(nonExistentId);

		// Then
		await expect(response).rejects.toThrow('User operation failed.');
		await expect(response).rejects.toHaveProperty('status', 401);
		await expect(response).rejects.toHaveProperty('messages', 'User does not exist');
	});
});