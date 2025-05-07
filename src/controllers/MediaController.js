import MediaService from "../services/MediaService.js";

export default class MediaController {
	static async searchMedia(req, res, next) {
		try {
			const response = await MediaService.search(req.body);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}

	static async getMediaById(req, res, next) {
		try {
			const response = await MediaService.get(req.params.id);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}

	static async playMedia(req, res, next) {
		try {
			const response = await MediaService.play(req.body, req.user);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}
}