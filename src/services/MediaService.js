import DBService from "./DBService.js";
import MediaError from "../errors/MediaError.js";
import InfomaniakPlayerService from "./InfomaniakPlayerService.js";

export default class MediaService {
	static async search({name = "", limit = 10, page = 1, tags = []} = {}) {
		const hasTags = tags.length > 0;
		const sql = `SELECT m.id, m.name, m.description, m.price, m.share_id, GROUP_CONCAT(t.name) as tags
                 FROM medias m
                          LEFT JOIN medias_has_tags mt ON m.id = mt.media_id
                          LEFT JOIN tags t ON mt.tag_id = t.id
                 WHERE (m.name LIKE ? OR ? IS NULL) ${hasTags ? "AND (t.name IN (?))" : ""}
                 	AND m.available = 1
                 GROUP BY m.id
                 ORDER BY m.name
                 LIMIT ? OFFSET ?`;
		const params = [`%${name}%`, name];
		if (hasTags) {
			params.push(tags);
		}
		params.push(limit, (page - 1) * limit);

		const result = await DBService.query(sql, params);

		const medias = result.map(media => ({
			...media,
			tags: media.tags ? media.tags.split(',') : []
		}));

		const totalCountSql = `SELECT COUNT(DISTINCT m.id) as total
                           FROM medias m
                                    LEFT JOIN medias_has_tags mt ON m.id = mt.media_id
                                    LEFT JOIN tags t ON mt.tag_id = t.id
                           WHERE (m.name LIKE ? OR ? IS NULL)
                             AND m.available = 1
                               ${hasTags ? "AND (t.name IN (?))" : ""}`;
		const totalCountParams = [`%${name}%`, name];
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

	static async get(id) {
		const sql = `SELECT m.id, m.name, m.description, m.price, m.share_id as shareId, GROUP_CONCAT(t.name) as tags
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
		result = result[0];
		if (!(result.tags instanceof Array)) {
			result.tags = [result.tags];
		}
		return result;
	}

	static async play({id}, userId) {
		await MediaService.checkUserCanPlay(id, userId);
		const sql = `SELECT share_id as shareId
                 FROM medias
                 WHERE id = ?`;
		const params = [id];
		const result = await DBService.query(sql, params);
		return {
			url: await InfomaniakPlayerService.generateEmbedUrl(result[0].shareId),
		}
	}

	static async checkUserCanPlay(mediaId, userId) {
		const sql = `SELECT COUNT(*) as count
                 FROM medias_has_users mu
                          JOIN medias m ON mu.media_id = m.id
                 WHERE mu.user_id = ?
                   AND mu.media_id = ?
                   AND m.available = 1`;
		const params = [userId, mediaId];
		const result = await DBService.query(sql, params);
		if (result.length === 0) {
			throw new MediaError("Media not found", 404);
		}
		if (result[0].count === 0) {
			throw new MediaError("User cannot play this media", 403);
		}
		return true;
	}
}