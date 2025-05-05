import DBService from "./DBService.js";
import MediaError from "../errors/MediaError.js";

export default class MediaService {
	static async search(name = null, limit = 10, page = 1, tags = []) {
		// select all media with name like %name% and tags in tags
		const sql = `SELECT m.id, m.name, m.description, m.price, m.share_id, GROUP_CONCAT(t.name) as tags
                 FROM medias m
                          LEFT JOIN medias_has_tags mt ON m.id = mt.media_id
                          LEFT JOIN tags t ON mt.tag_id = t.id
                 WHERE (m.name LIKE ? OR ? IS NULL)
                   AND (t.name IN (?) OR ? IS NULL)
                 GROUP BY m.id
                 LIMIT ? OFFSET ?`;
		const params = [`%${name}%`, name, tags, tags, limit, (page - 1) * limit];
		const result = await DBService.query(sql, params);
		const totalCountSql = `SELECT COUNT(*) as total
                           FROM medias m
                                    LEFT JOIN medias_has_tags mt ON m.id = mt.media_id
                                    LEFT JOIN tags t ON mt.tag_id = t.id
                           WHERE (m.name LIKE ? OR ? IS NULL)
                             AND (t.name IN (?) OR ? IS NULL)`;
		const totalCountParams = [`%${name}%`, name, tags, tags];
		const total = (await DBService.query(totalCountSql, totalCountParams))[0].total;
		return {
			total: parseInt(total),
			page: page,
			limit: limit,
			medias: result
		};
	}

	static async get(id) {
		const sql = `SELECT m.id, m.name, m.description, m.price, m.share_id as shareId, GROUP_CONCAT(t.name) as tags
                 FROM medias m
                          LEFT JOIN medias_has_tags mt ON m.id = mt.media_id
                          LEFT JOIN tags t ON mt.tag_id = t.id
                 WHERE m.id = ?
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
}