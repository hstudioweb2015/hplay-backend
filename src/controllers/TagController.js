import TagService from "../services/TagService.js";
import TagError from "../errors/TagError.js";

export default class TagController {
	static async getTags(req, res, next) {
		try {
			const tags = await TagService.getAll();
			res.status(200).json(tags);
		} catch (error) {
			next(error);
		}
	}

	static async getTagById(req, res, next) {
		try {
			const tag = await TagService.getById(req.body);
			res.status(200).json(tag);
		} catch (error) {
			next(error);
		}
	}

	static async createTag(req, res, next) {
		try {
			const tag = await TagService.create(req.body);
			res.status(201).json(tag);
		} catch (error) {
			next(error);
		}
	}

	static async updateTag(req, res, next) {
		try {
			const tag = await TagService.update(req.body);
			res.status(200).json(tag);
		} catch (error) {
			next(error);
		}
	}

	static async deleteTag(req, res, next) {
		try {
			const tag = await TagService.delete(req.body);
			res.status(200).json(tag);
		} catch (error) {
			next(error);
		}
	}
}