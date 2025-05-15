import DBService from "./DBService.js";
import MediaError from "../errors/MediaError.js";
import InfomaniakPlayerService from "./InfomaniakPlayerService.js";
import Media from "../models/Media.js";
import Busboy from "busboy";
import got from "got";

export default class MediaService {

	/**
	 * Creates a new media in the database
	 * @param name {String} - Media name
	 * @param limit {Integer} - Number of results per page
	 * @param page {Integer} - Page number
	 * @param tags {Array} - Array of tags
	 * @param userId {Integer} - User id
	 * @returns {Promise<{total: number, startAt: number, page: number, limit: number, medias: Array<Media>}>}
	 */
	static async search({name = "", limit = 10, page = 1, tags = [], userId = null} = {}) {
		const hasTags = tags.length > 0;
		const tagPlaceholders = tags.map(() => '?').join(', ');
		const sql = `
        SELECT m.id,
               m.name,
               m.description,
               m.price,
               m.preview,
               GROUP_CONCAT(t.name) AS tags
        FROM medias m
                 LEFT JOIN medias_has_tags mt ON m.id = mt.media_id
                 LEFT JOIN tags t ON mt.tag_id = t.id
        WHERE m.available = 1
            ${name ? "AND (m.name LIKE ?)" : ""} ${userId ? "AND m.id IN (SELECT media_id FROM medias_has_users WHERE user_id = ?)" : ""} ${hasTags ? `AND m.id IN (
        SELECT media_id
        FROM medias_has_tags mt2
        JOIN tags t2 ON mt2.tag_id = t2.id
        WHERE t2.name IN (${tagPlaceholders})
        GROUP BY media_id
        HAVING COUNT(DISTINCT t2.name) = ?
    )` : ""}
        GROUP BY m.id
        ORDER BY m.name
        LIMIT ? OFFSET ?
		`;

		const params = [];
		if (name) {
			params.push(`%${name}%`);
		}
		if (userId) {
			params.push(userId);
		}
		if (hasTags) {
			params.push(...tags, tags.length);
		}

		params.push(limit, (page - 1) * limit);

		const result = await DBService.query(sql, params);


		let medias = result.map(media => ({
			...media,
			tags: media.tags ? media.tags.split(',') : []
		}));

		medias = medias.map(media => Object.assign(new Media(), media));


		const totalCountSql = `SELECT COUNT(DISTINCT m.id) as total
                           FROM medias m
                                    LEFT JOIN medias_has_tags mt ON m.id = mt.media_id
                                    LEFT JOIN tags t ON mt.tag_id = t.id
                           WHERE (m.name LIKE ? OR ? IS NULL)
                             AND m.available = 1
                               ${hasTags ? "AND (t.name IN (?))" : ""} ${userId ? "AND m.id IN (SELECT media_id FROM medias_has_users WHERE user_id = ?)" : ""}`;
		const totalCountParams = [`%${name}%`, name];
		if (userId) {
			totalCountParams.push(userId);
		}
		if (hasTags) {
			totalCountParams.push(tags);
		}

		const total = (await DBService.query(totalCountSql, totalCountParams))[0].total;

		return {
			total: parseInt(total),
			startAt: (page - 1) * limit + 1,
			page: page,
			limit: limit,
			medias: medias
		};
	}

	/**
	 * Get a media by id
	 * @param id {Integer} - Media id
	 * @returns {Promise<Media>} - Media object
	 */
	static async get({id}) {
		const sql = `SELECT m.id,
                        m.name,
                        m.description,
                        m.price,
                        m.preview,
                        GROUP_CONCAT(t.name) as tags
                 FROM medias m
                          LEFT JOIN medias_has_tags mt ON m.id = mt.media_id
                          LEFT JOIN tags t ON mt.tag_id = t.id
                 WHERE m.id = ?
                   AND m.available = 1
                 GROUP BY m.id`;
		const params = [id];
		let result = await DBService.query(sql, params);
		if (result.length === 0) {
			throw new MediaError("Media not found", 404);
		}
		result = Object.assign(new Media(), result[0]);
		result.tags = result.tags ? result.tags.split(',') : [];
		return result;
	}

	static async create({name, description, price, tags, available = 1}) {

	}

	static async upload({id}, headers, file) {
		// use busboy for uploading files by chunks
		const busboy = new Busboy({headers: headers});
		let metadata = null;

		busboy.on("file", (fieldname, fileStream, filename, encoding, mimetype) => {
			if (fieldname !== "file") return;

			const uploadStream = got.stream.post(`https://api.infomaniak.com/v1/media/${id}/upload`, {
				headers: {
					"Authorization": `Bearer ${process.env.INFOMANIAK_API_KEY}`,
					"Content-Type": mimetype,
					"Content-Length": fileStream.length,
				},
			});
			fileStream.pipe(uploadStream);
			uploadStream.on("response", (response) => {
				if (response.statusCode === 200) {
					console.log("File uploaded successfully");
				} else {
					console.error("Error uploading file:", response.statusCode);
				}
			});
			uploadStream.on("error", (error) => {
				console.error("Error uploading file:", error);
			});
		});

	}

	/**
	 * Request a url with unique token to play a media
	 * @param id {Integer} - Media id
	 * @param user {User} - User object
	 * @returns {Promise<{url: string}>} - url to play the media with unique token
	 */
	static async play({id}, user) {
		await MediaService.checkUserCanPlay(id, user);
		const sql = `SELECT share_id as shareId
                 FROM medias
                 WHERE id = ?`;
		const params = [id];
		const result = await DBService.query(sql, params);
		return {
			url: await InfomaniakPlayerService.generateEmbedUrl(result[0].shareId),
		}
	}

	/**
	 * Check if user can play the media
	 * @param mediaId {Integer} - Media id
	 * @param user {User} - User object
	 * @returns {Promise<boolean>}
	 */
	static async checkUserCanPlay(mediaId, user) {
		if (user.isAdmin) return true;
		const sql = `SELECT COUNT(*) as count
                 FROM medias_has_users
                          JOIN medias m ON medias_has_users.media_id = m.id
                 WHERE m.available = 1
                   AND user_id = ?
                   AND media_id = ?`;
		const params = [user.id, mediaId];
		const result = await DBService.query(sql, params);
		if (result[0].count == 0) {
			throw new MediaError("User cannot play this media", 403);
		}
		return true;
	}

	/**
	 * Get all tags
	 * @param referenceId {string} - Reference id
	 * @returns {Promise<Array>} - Array of tags
	 */
	static async getMediasIdByReferenceId(referenceId) {
		const sql = `SELECT medias_id
                 FROM medias_has_payments
                          INNER JOIN payments ON payments.id = medias_has_payments.payments_id
                 WHERE payments.reference_id = ?`;
		const params = [referenceId];
		const result = await DBService.query(sql, params);
		if (result.length > 0) {
			return result.map(media => media.medias_id);
		}
		return null;
	}

	/**
	 * Get all tags
	 * @param medias {Array} - Array of media ids
	 * @param userId {Integer} - User id
	 * @returns {Promise<Void>}
	 */
	static async addMediasToUser(medias, userId) {
		const sql = `INSERT INTO medias_has_users (media_id, user_id)
                 VALUES (?, ?)`;
		for (const mediaId of medias) {
			const params = [mediaId, userId];
			await DBService.query(sql, params);
		}
	}

	/**
	 * Remove all medias from user
	 * @param medias {Array} - Array of media ids
	 * @param userId {Integer} - User id
	 * @returns {Promise<Void>}
	 */
	static async removeMediasToUser(medias, userId) {
		const sql = `DELETE
                 FROM medias_has_users
                 WHERE media_id = ?
                   AND user_id = ?`;
		for (const mediaId of medias) {
			const params = [mediaId, userId];
			await DBService.query(sql, params);
		}
	}
}