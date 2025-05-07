import MediaService from "../services/MediaService.js";

export default class MediaController {
	/**
	 * Search for medias
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	static async searchMedia(req, res, next) {
		try {
			const response = await MediaService.search(req.body);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get media by id
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	static async getMediaById(req, res, next) {
		try {
			const response = await MediaService.get(req.params.id);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * request a url with unique token to play a media
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	static async playMedia(req, res, next) {
		try {
			const response = await MediaService.play(req.body, req.user);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}
}