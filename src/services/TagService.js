import DBService from "./DBService.js";
import Tag from "../models/Tag.js";
import TagError from "../errors/TagError.js";

export default class TagService {
	static async create({name}) {
		const sql = `INSERT INTO tags (name)
                 VALUES (?)`;
		const params = [name];
		const id = await DBService.query(sql, params, true);
		return new Tag(id, name);
	}

	static async getAll() {
		const sql = `SELECT id, name
                 FROM tags`;
		const params = [];
		const result = await DBService.query(sql, params);
		return result.map(tag => Object.assign(new Tag(), tag));
	}

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

	static async update({id, name}) {
		const sql = `UPDATE tags
                 SET name = ?
                 WHERE id = ?`;
		const params = [name, id];
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

	static async delete({id}) {
		const sql = `DELETE
                 FROM tags
                 WHERE id = ?`;
		const params = [id];
		let response;
		try {
			response = await DBService.query(sql, params);
		} catch (error) {
			if (error.code === "ER_ROW_IS_REFERENCED_2") {
				throw new TagError("Tag is used in a media", 409);
			}
			throw error;
		}
		if (response.affectedRows === 0) {
			throw new TagError("Tag not found", 404);
		}
		return {message: "Tag deleted"};
	}
}