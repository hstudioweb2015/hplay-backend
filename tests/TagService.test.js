import Tag from "../src/models/Tag.js";
import TagService from "../src/services/TagService.js";
import {connectDB} from "../src/configs/db.js";
import DBService from "../src/services/DBService.js";
import TagError from "../src/errors/TagError.js";

beforeAll(async () => {
	await connectDB();
});

describe('Tag Service', () => {
	it('should create a tag', async () => {
		// Given
		const name = 'exampleTag';
		const tag = new Tag(1, name);
		DBService.query = jest.fn().mockResolvedValue(1);

		// When
		const response = await TagService.create({name});

		// Then
		expect(response).toHaveProperty('id');
		expect(response).toHaveProperty('name', name);
	});

	it('should get all tags', async () => {
		// Given
		const tags = [new Tag(1, 'tag1'), new Tag(2, 'tag2')];
		DBService.query = jest.fn().mockResolvedValue(tags);

		// When
		const response = await TagService.getAll();

		// Then
		expect(response).toHaveLength(tags.length);
		expect(response[0]).toHaveProperty('id', tags[0].id);
		expect(response[0]).toHaveProperty('name', tags[0].name);
	});

	it('should get a tag by id', async () => {
		// Given
		const tag = new Tag(1, 'exampleTag');
		DBService.query = jest.fn().mockResolvedValue([tag]);

		// When
		const response = await TagService.getById({id: 1});

		// Then
		expect(response).toHaveProperty('id', tag.id);
		expect(response).toHaveProperty('name', tag.name);
	});

	it('should update a tag', async () => {
		// Given
		const tag = new Tag(1, 'exampleTag');
		DBService.query = jest.fn().mockResolvedValue({affectedRows: 1});

		// When
		const response = await TagService.update({id: 1, name: 'updatedTag'});

		// Then
		expect(response).toHaveProperty('id', tag.id);
		expect(response).toHaveProperty('name', 'updatedTag');
	});

	it('should delete a tag', async () => {
		// Given
		const tag = new Tag(1, 'exampleTag');
		DBService.query = jest.fn().mockResolvedValue({affectedRows: 1});

		// When
		const response = await TagService.delete({id: 1});

		// Then
		expect(response).toHaveProperty('message', 'Tag deleted');
	});

	it('should throw an error if tag does not exist', async () => {
		// Given
		DBService.query = jest.fn().mockResolvedValue([]);

		// When
		const response = TagService.getById({id: 999});

		// Then
		await expect(response).rejects.toThrow('Tag operation failed.');
		await expect(response).rejects.toHaveProperty('status', 404);
		await expect(response).rejects.toHaveProperty('messages', 'Tag not found');
	});

});