import MediaService from '../src/services/MediaService.js';
import {connectDB} from "../src/configs/db.js";
import DBService from "../src/services/DBService.js";

function getMedia() {
	return {
		id: 1,
		name: 'exampleName',
		description: 'exampleDescription',
		price: 100,
		shareId: "aaa-bbbb-cccc-dddd",
		tags: ['exampleTag']
	};
}

beforeEach(async () => {
	await connectDB();
	const media = getMedia();
	await DBService.query(
			'INSERT INTO medias (id, name, description, price, share_id) VALUES (?, ?, ?, ?, ?)',
			[1, media.name, media.description, media.price, media.shareId],
			true
	);
	await DBService.query(
			'INSERT INTO tags (id, name) VALUES (?, ?)',
			[1, 'exampleTag'],
			true
	);
	await DBService.query(
			'INSERT INTO medias_has_tags (media_id, tag_id) VALUES (?, ?)',
			[1, 1],
	);
});

afterEach(async () => {
	await DBService.query('DELETE FROM medias_has_tags WHERE media_id = ? AND tag_id = ?', [1, 1]);
	await DBService.query('DELETE FROM tags WHERE id = ?', [1]);
	await DBService.query('DELETE FROM medias WHERE id = ?', [1]);
});

describe('Media Service', () => {
	it('should search medias', async () => {
		// Given
		const name = 'exampleName';
		const limit = 10;
		const page = 1;
		const tags = ['exampleTag'];
		const media = getMedia();

		// When
		const response = await MediaService.search({name, limit, page, tags});
		// Then
		expect(response).toHaveProperty('total', 1);
		expect(response).toHaveProperty('page', 1);
		expect(response).toHaveProperty('limit', 10);
		expect(response).toHaveProperty('medias');
		expect(response.medias).toHaveLength(1);
		expect(response.medias[0]).toHaveProperty('id', media.id);
	});

	it('should not find any media', async () => {
		// Given
		const name = 'nonExistingName';
		const limit = 10;
		const page = 1;
		const tags = ['nonExistingTag'];

		// When
		const response = await MediaService.search({name, limit, page, tags});

		// Then
		expect(response).toHaveProperty('total', 0);
		expect(response).toHaveProperty('page', 1);
		expect(response).toHaveProperty('limit', 10);
		expect(response).toHaveProperty('medias');
		expect(response.medias).toHaveLength(0);
	});

	it('should get a media by id', async () => {
		// Given
		const id = 1;
		const media = getMedia();

		// When
		const response = await MediaService.get({id});

		// Then
		expect(response).toHaveProperty('id', media.id);
		expect(response).toHaveProperty('name', media.name);
		expect(response).toHaveProperty('description', media.description);
		expect(response).toHaveProperty('price', media.price);
		expect(response).toHaveProperty('shareId', media.shareId);
		expect(response).toHaveProperty('tags');
		expect(response.tags).toEqual(media.tags);
	});

	it('should not find any media by id', async () => {
		// Given
		const id = 999;

		// When
		const response = MediaService.get(id);

		// Then
		await expect(response).rejects.toThrow('Media operation failed.');
		await expect(response).rejects.toHaveProperty('status', 404);
		await expect(response).rejects.toHaveProperty('messages', 'Media not found');
	});

	it('should generate a media embed URL', async () => {
		// Given
		const shareId = 'aaa-bbbb-cccc-dddd';
		const expectedUrl = `https://player.vod2.infomaniak.com/embed/${shareId}?token=`;
		// Mock the fetch function
		global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({data: 'token=exampleToken'}),
				})
		);
		MediaService.checkUserCanPlay = jest.fn(() => Promise.resolve(true));

		// When
		const response = await MediaService.play({id: 1}, 1);

		// Then
		expect(response).toHaveProperty('url');

	});
});