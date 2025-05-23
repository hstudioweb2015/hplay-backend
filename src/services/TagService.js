import DBService from "./DBService.js";
import Tag from "../models/Tag.js";
import TagError from "../errors/TagError.js";

export default class TagService {
	/**
	 * Create a new tag
	 * @param name
	 * @returns {Promise<Tag>}
	 */
	static async create({name}) {
		const sql = `INSERT INTO tags (name)
                 VALUES (?)`;
		const params = [name];
		const id = await DBService.query(sql, params, true);
		return new Tag(id, name);
	}

	/**
	 * Get all tags
	 * @returns {Promise<Tag[]>}
	 */
	static async getAll() {
		const sql = `SELECT id, name
                 FROM tags`;
		const params = [];
		const result = await DBService.query(sql, params);
		return result.map(tag => Object.assign(new Tag(), tag));
	}

	/**
	 * Get a tag by id
	 * @param id {number} - The id of the tag
	 * @returns {Promise<Tag>}
	 */
	static async getById({id}) {
		const sql = `SELECT id, name
                 FROM tags
                 WHERE id = ?`;
		const params = [id];
		const result = await DBService.query(sql, params);
		if (result.length === 0) {
			throw new TagError("Tag not found", 404);
		}
		return Object.assign(new Tag(), result[0]);
	}

	static async getByName({name}) {
		const sql = `SELECT id, name
                 FROM tags
                 WHERE name = ?`;
		const params = [name];
		const result = await DBService.query(sql, params);
		if (result.length === 0) {
			throw new TagError("Tag not found", 404);
		}
		return Object.assign(new Tag(), result[0]);
	}

	/**
	 * Update a tag
	 * @param id {number} - The id of the tag
	 * @param name {string} - The new name of the tag
	 * @returns {Promise<Tag>}
	 */
	static async update({id, name}) {
		const sql = `UPDATE tags
                 SET name = ?
                 WHERE id = ?`;
		const params = [name.trim(), id];
		let response;
		try {
			response = await DBService.query(sql, params);
		} catch (error) {
			if (error.code === "ER_DUP_ENTRY") {
				throw new TagError("Tag already exists", 409);
			}
			throw error;
		}
		if (response.affectedRows === 0) {
			throw new TagError("Tag not found", 404);
		}
		return new Tag(id, name);
	}

	/**
	 * Delete a tag
	 * @param id {number} - The id of the tag
	 * @returns {Promise<{message: string}>}
	 */
	static async delete({id}) {
		await this.removeTagFromAllMedia(id);
		const sql = `DELETE
                 FROM tags
                 WHERE id = ?`;
		const params = [id];
		let response;
		try {
			response = await DBService.query(sql, params);
		} catch (error) {
			throw error;
		}
		if (response.affectedRows === 0) {
			throw new TagError("Tag not found", 404);
		}
		return {message: "Tag deleted"};
	}

	static async addTagWithMedia(mediaId, tagId) {
		const sql = `INSERT INTO medias_has_tags (media_id, tag_id)
                 VALUES (?, ?)`;
		const params = [mediaId, tagId];
		await DBService.query(sql, params);
	}

	static async removeTagFromMedia(mediaId, tagId) {
		const sql = `DELETE
                 FROM medias_has_tags
                 WHERE media_id = ?
                   AND tag_id = ?`;
		const params = [mediaId, tagId];
		await DBService.query(sql, params);
	}

	static async removeTagFromAllMedia(tagId) {
		const sql = `DELETE
                 FROM medias_has_tags
                 WHERE tag_id = ?`;
		const params = [tagId];
		await DBService.query(sql, params);
	}
}