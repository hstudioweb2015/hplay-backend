import MediaService from '../src/services/MediaService.js';
import {connectDB} from "../src/configs/db.js";
import DBService from "../src/services/DBService.js";

beforeAll(async () => {
	await connectDB();
});

describe('Media Service', () => {
	const mockMedia = {
		id: 1,
		name: 'TestMedia',
		description: 'Test Description',
		price: 1000,
		preview: 'preview.jpg',
		shareId: 'test-share-id',
		tags: ['tag1', 'tag2']
	};

	it('should search medias', async () => {
		// Given
		const searchParams = {
			name: 'Test',
			limit: 10,
			page: 1,
			tags: ['tag1']
		};
		DBService.query = jest.fn()
				.mockResolvedValueOnce([{...mockMedia, tags: mockMedia.tags.join(',')}])
				.mockResolvedValueOnce([{ total: 1 }]);

		// When
		const response = await MediaService.search(searchParams);

		// Then
		expect(response).toHaveProperty('total', 1);
		expect(response).toHaveProperty('page', 1);
		expect(response).toHaveProperty('limit', 10);
		expect(response.medias[0]).toHaveProperty('id', mockMedia.id);
		expect(response.medias[0]).toHaveProperty('tags', mockMedia.tags);
	});

	it('should get media by id', async () => {
		// Given
		DBService.query = jest.fn()
				.mockResolvedValue([{...mockMedia, tags: mockMedia.tags.join(',')}]);

		// When
		const response = await MediaService.get({ id: 1 });

		// Then
		expect(response).toHaveProperty('id', mockMedia.id);
		expect(response).toHaveProperty('name', mockMedia.name);
		expect(response).toHaveProperty('description', mockMedia.description);
		expect(response).toHaveProperty('tags', mockMedia.tags);
	});

	it('should throw error if media not found', async () => {
		// Given
		DBService.query = jest.fn().mockResolvedValue([]);

		// When & Then
		await expect(async () => {
			await MediaService.get({ id: 999 });
		}).rejects.toThrow('Media operation failed.');
		await expect(async () => {
			await MediaService.get({ id: 999 });
		}).rejects.toHaveProperty('messages', 'Media not found');
	});

	it('should generate media play url', async () => {
		// Given
		const mockUser = { id: 1, isAdmin: false };
		const expectedUrl = 'https://player.example.com/embed';

		DBService.query = jest.fn()
				.mockResolvedValueOnce([{ count: 1 }])
				.mockResolvedValueOnce([{ shareId: 'test-share-id' }]);
		global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: 'token=test-token' })
				})
		);

		// When
		const response = await MediaService.play({ id: 1 }, mockUser);

		// Then
		expect(response).toHaveProperty('url');
	});

	it('should throw error if user cannot play media', async () => {
		// Given
		const mockUser = { id: 1, isAdmin: false };
		DBService.query = jest.fn().mockResolvedValue([{ count: 0 }]);

		// When & Then
		await expect(async () => {
			await MediaService.checkUserCanPlay(1, mockUser);
		}).rejects.toThrow('Media operation failed.');
		await expect(async () => {
			await MediaService.checkUserCanPlay(1, mockUser);
		}).rejects.toHaveProperty('messages', 'User cannot play this media');
	});

	it('should get medias by reference id', async () => {
		// Given
		const mockMediaIds = [1, 2];
		DBService.query = jest.fn().mockResolvedValue(
				mockMediaIds.map(id => ({ medias_id: id }))
		);

		// When
		const response = await MediaService.getMediasIdByReferenceId('test-ref');

		// Then
		expect(response).toEqual(mockMediaIds);
	});

	it('should add medias to user', async () => {
		// Given
		const mockMediaIds = [1, 2];
		const userId = 1;
		DBService.query = jest.fn();

		// When
		await MediaService.addMediasToUser(mockMediaIds, userId);

		// Then
		expect(DBService.query).toHaveBeenCalledTimes(mockMediaIds.length);
	});

	it('should remove medias from user', async () => {
		// Given
		const mockMediaIds = [1, 2];
		const userId = 1;
		DBService.query = jest.fn();

		// When
		await MediaService.removeMediasToUser(mockMediaIds, userId);

		// Then
		expect(DBService.query).toHaveBeenCalledTimes(mockMediaIds.length);
	});
});