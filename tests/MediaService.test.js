import MediaService from '../src/services/MediaService.js';
import {connectDB} from "../src/configs/db.js";
import DBService from "../src/services/DBService.js";
import InfomaniakService from "../src/services/InfomaniakService.js";
import TagService from "../src/services/TagService.js";

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
				.mockResolvedValueOnce([{total: 1}]);

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
		const response = await MediaService.get({id: 1});

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
			await MediaService.get({id: 999});
		}).rejects.toThrow('Media operation failed.');
		await expect(async () => {
			await MediaService.get({id: 999});
		}).rejects.toHaveProperty('messages', 'Media not found');
	});

	it('should generate media play url', async () => {
		// Given
		const mockUser = {id: 1, isAdmin: false};
		const expectedUrl = 'https://player.example.com/embed';

		// Mock InfomaniakService
		const originalInfomaniakService = {...InfomaniakService};
		InfomaniakService.generateEmbedUrl = jest.fn().mockResolvedValue(expectedUrl);

		DBService.query = jest.fn()
				.mockResolvedValueOnce([{count: 1}])
				.mockResolvedValueOnce([{shareId: 'test-share-id'}]);

		// When
		const response = await MediaService.play({id: 1}, mockUser);

		// Then
		expect(response).toHaveProperty('url', expectedUrl);
		expect(InfomaniakService.generateEmbedUrl).toHaveBeenCalledWith('test-share-id');

		// Restore original InfomaniakService
		Object.assign(InfomaniakService, originalInfomaniakService);
	});

	it('should throw error if user cannot play media', async () => {
		// Given
		const mockUser = {id: 1, isAdmin: false};
		DBService.query = jest.fn().mockResolvedValue([{count: 0}]);

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
				mockMediaIds.map(id => ({medias_id: id}))
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

	it('should create a new media', async () => {
		// Given
		const newMedia = {
			name: 'New Media',
			description: 'New Description',
			price: 1500,
			tags: ['tag1', 'tag3']
		};

		DBService.query = jest.fn()
				.mockResolvedValueOnce({insertId: 1}) // media insert
				.mockResolvedValueOnce([]) // tag1 search
				.mockResolvedValueOnce({insertId: 1}) // tag1 insert
				.mockResolvedValueOnce([{id: 2}]) // tag3 search
				.mockResolvedValueOnce() // tag1 media relation
				.mockResolvedValueOnce() // tag3 media relation
				.mockResolvedValueOnce([{...mockMedia, tags: mockMedia.tags.join(',')}]); // get media

		// When
		const response = await MediaService.create(newMedia);

		// Then
		expect(response).toHaveProperty('id', mockMedia.id);
		expect(response).toHaveProperty('name', mockMedia.name);
		expect(DBService.query).toHaveBeenCalledTimes(7);
	});

	it('should update an existing media', async () => {
		// Given
		const updateData = {
			id: 1,
			name: 'Updated Media',
			description: 'Updated Description',
			price: 2000,
			tags: ['tag1', 'tag3']
		};

		// Mock get media before update
		DBService.query = jest.fn()
				.mockResolvedValueOnce([{...mockMedia, tags: mockMedia.tags.join(',')}])
				.mockResolvedValueOnce() // update query
				.mockResolvedValueOnce([{...updateData, tags: updateData.tags.join(',')}]); // get updated media

		// Mock TagService methods
		const originalTagService = {...TagService};
		TagService.getByName = jest.fn().mockResolvedValue({id: 1});
		TagService.removeTagFromMedia = jest.fn().mockResolvedValue();
		TagService.addTagWithMedia = jest.fn().mockResolvedValue();

		// When
		const response = await MediaService.update(updateData);

		// Then
		expect(response).toHaveProperty('id', updateData.id);
		expect(response).toHaveProperty('name', updateData.name);
		expect(response).toHaveProperty('description', updateData.description);
		expect(response).toHaveProperty('price', updateData.price);

		// Restore original TagService
		Object.assign(TagService, originalTagService);
	});

	it('should delete a media', async () => {
		// Given
		DBService.query = jest.fn()
				.mockResolvedValueOnce([{...mockMedia, tags: mockMedia.tags.join(',')}]) // get media
				.mockResolvedValueOnce(); // update available status

		// When
		const response = await MediaService.delete({id: 1});

		// Then
		expect(response).toHaveProperty('message', 'Media deleted');
		expect(DBService.query).toHaveBeenCalledTimes(2);
	});

	it('should get infomaniak id by media id', async () => {
		// Given
		const infomaniakId = 'inf-123456';
		DBService.query = jest.fn().mockResolvedValue([{infomaniak_id: infomaniakId}]);

		// When
		const response = await MediaService.getInfomaniakIdById(1);

		// Then
		expect(response).toBe(infomaniakId);
	});

	it('should return null if infomaniak id not found', async () => {
		// Given
		DBService.query = jest.fn().mockResolvedValue([]);

		// When
		const response = await MediaService.getInfomaniakIdById(999);

		// ThenHPlay
		expect(response).toBeNull();
	});

	it('should upload a thumbnail', async () => {
		// Given
		const mockFile = {
			path: '/tmp/upload/image.jpg',
			originalname: 'image.jpg',
			mimetype: 'image/jpeg',
			size: 1024
		};
		const infomaniakId = 'inf-123456';
		const previewUrl = 'https://example.com/preview.jpg';

		// Mock services
		const originalInfomaniakService = {...InfomaniakService};
		InfomaniakService.uploadThumbnail = jest.fn().mockResolvedValue();
		InfomaniakService.getThumbnail = jest.fn().mockResolvedValue(previewUrl);

		MediaService.getInfomaniakIdById = jest.fn().mockResolvedValue(infomaniakId);
		DBService.query = jest.fn().mockResolvedValue();

		// When
		const response = await MediaService.uploadThumbnail({id: 1}, mockFile);

		// Then
		expect(response).toHaveProperty('status', 'success');
		expect(InfomaniakService.uploadThumbnail).toHaveBeenCalledWith(infomaniakId, mockFile);
		expect(DBService.query).toHaveBeenCalledTimes(1);

		// Restore original InfomaniakService
		Object.assign(InfomaniakService, originalInfomaniakService);
	});
});