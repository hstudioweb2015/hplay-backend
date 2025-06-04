import DBService from "./DBService.js";
import MediaError from "../errors/MediaError.js";
import InfomaniakService from "./InfomaniakService.js";
import Media from "../models/Media.js";
import FormData from "form-data";
import {PassThrough, pipeline} from "stream";
import fetch from "node-fetch";
import Busboy from "busboy";
import {infomaniak, uploadMaxBufferSize} from "../configs/config.js";
import TagService from "./TagService.js";
import Tag from "../models/Tag.js";
import http from "http";
import https from "https";

const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_RETRIES = 3;
const MAX_BUFFER_SIZE = 10 * MAX_CHUNK_SIZE; // 50 MB RAM limit

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
                           WHERE m.available = 1
                               ${name ? "AND (m.name LIKE ?)" : ""} ${userId ? "AND m.id IN (SELECT media_id FROM medias_has_users WHERE user_id = ?)" : ""} ${hasTags ? `AND m.id IN (
                               SELECT media_id
                               FROM medias_has_tags mt2
                               JOIN tags t2 ON mt2.tag_id = t2.id
                               WHERE t2.name IN (${tags.map(() => '?').join(', ')})
                               GROUP BY media_id
                               HAVING COUNT(DISTINCT t2.name) = ?
                           )` : ""}`;

		const totalCountParams = [];
		if (name) {
			totalCountParams.push(`%${name}%`);
		}
		if (userId) {
			totalCountParams.push(userId);
		}
		if (hasTags) {
			totalCountParams.push(...tags, tags.length);
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

	/**
	 * Create a new media
	 * @param name {String} - Media name
	 * @param description {String} - Media description
	 * @param price {Number} - Media price (in cents)
	 * @param tags {Array} - Array of tags
	 * @param available {Integer} - Number of available copies
	 * @returns {Promise<Media>} - Media object
	 */
	static async create({name, description, price, tags, available = 1}) {
		const sql = `INSERT INTO medias (name, description, price, available)
                 VALUES (?, ?, ?, ?)`;
		const params = [name, description, price, available];
		const result = await DBService.query(sql, params);
		const mediaId = result.insertId;

		// get tags id or create them if they don't exist
		const tagIds = [];
		for (const tag of tags) {
			const tagSql = `SELECT id
                      FROM tags
                      WHERE name = ?`;
			const tagParams = [tag];
			let tagResult = await DBService.query(tagSql, tagParams);
			if (tagResult.length === 0) {
				const insertTagSql = `INSERT INTO tags (name)
                              VALUES (?)`;
				const insertTagParams = [tag];
				tagResult = await DBService.query(insertTagSql, insertTagParams);
				tagIds.push(tagResult.insertId);
			} else {
				tagIds.push(tagResult[0].id);
			}
		}

		// insert tags into medias_has_tags
		const sqlInsertTags = `INSERT INTO medias_has_tags (media_id, tag_id)
                           VALUES (?, ?)`;
		for (const tagId of tagIds) {
			const params = [mediaId, tagId];
			await DBService.query(sqlInsertTags, params);
		}

		return this.get({id: mediaId});
	}

	static async update({id, name, description, price, tags, available = true}) {
		const media = await this.get({id});
		const sql = `UPDATE medias
                 SET name        = ?,
                     description = ?,
                     price       = ?,
                     available   = ?
                 WHERE id = ?`;
		const params = [name, description, price, available, id];
		await DBService.query(sql, params);

		const removeTags = media.tags.filter(tag => !tags.includes(tag));
		for (const tag of removeTags) {
			const tagId = (await TagService.getByName({name: tag})).id;
			await TagService.removeTagFromMedia(id, tagId);
		}

		const addTags = tags.filter(tag => !media.tags.includes(tag));
		for (const tag of addTags) {
			let tagId;
			try {
				tagId = (await TagService.getByName({name: tag})).id;
			} catch (e) {
				tagId = (await TagService.create({name: tag})).id;
			}
			await TagService.addTagWithMedia(id, tagId);
		}

		return this.get({id});
	}

	static async delete({id}) {
		await this.get({id});
		const sql = `UPDATE medias
                 SET available = 0
                 WHERE id = ?`;
		const params = [id];
		await DBService.query(sql, params);
		return {message: "Media deleted"};
	}

	/**
	 * Upload a file to Infomaniak
	 * @param id {Integer} - Media id
	 * @param headers {Object} - Request headers
	 * @param req {Object} - Request object
	 * @returns {Promise<{status: string}>} - Upload status
	 */
	static async upload({id}, headers, req) {
		let count = 0;
		const maxBufferSize = uploadMaxBufferSize * 1024 * 1024;
		const resumeBufferSize = maxBufferSize * 0.8; // 80% du buffer

		return new Promise(async (resolve, reject) => {
			const busboy = Busboy({headers});
			let fileName = (await this.get({id})).name;
			let fileStreamStarted = false;

			busboy.on("file", (fieldname, fileStream, fileData) => {
				if (fieldname !== "file") {
					fileStream.resume();
					return;
				}
				fileStreamStarted = true;

				const form = new FormData();
				const userAgent = req.headers['user-agent'] || 'Node.js/stream-proxy';
				form.append("client", "http");
				form.append("http_user_agent", userAgent);
				form.append("name", fileName);
				form.append("folder", infomaniak.folderId);

				const passThrough = new PassThrough();
				let transferredBytes = 0;

				passThrough.on('data', (chunk) => {
					transferredBytes += chunk.length;
					if (passThrough.readableLength >= maxBufferSize) {
						if (!fileStream.isPaused()) {
							fileStream.pause();
						}
					} else if (fileStream.isPaused() && passThrough.readableLength < resumeBufferSize) {
						fileStream.resume();
					}
				});

				form.append("file", passThrough, fileData);

				const uploadData = InfomaniakService.getUploadData();

				fetch(uploadData.url, {
					method: "POST",
					headers: uploadData.headers,
					body: form,
				})
						.then(async (apiRes) => {
							if (!apiRes.ok) {
								const err = await apiRes.text();
								reject(new Error(`Error uploading file: ${apiRes.status} ${apiRes.statusText} - ${err}`));
								return;
							}
							const response = await apiRes.json();
							if (!response.data || !response.data.id) {
								console.error('Upload response missing data.id:', response);
								reject(new Error('Upload succeeded but no file id returned by Infomaniak.'));
								return;
							}
							const infomaniakId = response.data.id;
							await InfomaniakService.publishMedia(infomaniakId);
							await InfomaniakService.waitForEncoding(infomaniakId);
							const shareId = await InfomaniakService.createShare(infomaniakId);
							const previewUrl = await InfomaniakService.getThumbnail(infomaniakId);

							const sql = `UPDATE medias
                           SET share_id      = ?,
                               preview       = ?,
                               infomaniak_id = ?
                           WHERE id = ?`;
							const params = [shareId, previewUrl, infomaniakId, id];
							await DBService.query(sql, params);
							resolve({status: "success"});
						})
						.catch(reject);

				pipeline(fileStream, passThrough, (err) => {
					if (err) reject(err);
				});
			});

			busboy.on("finish", () => {
				if (!fileStreamStarted) reject(new Error("No file received"));
			});

			req.pipe(busboy);
		});
	}

	static async uploadThumbnail({id}, file) {
		const infomaniakId = await this.getInfomaniakIdById(id);
		await InfomaniakService.uploadThumbnail(infomaniakId, file);
		const previewUrl = await InfomaniakService.getThumbnail(infomaniakId);
		const sql = `UPDATE medias
                 SET preview = ?
                 WHERE id = ?`;
		const params = [previewUrl, id];
		await DBService.query(sql, params);
		return {status: "success"};
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
			url: await InfomaniakService.generateEmbedUrl(result[0].shareId),
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

	static async getInfomaniakIdById(id) {
		const sql = `SELECT infomaniak_id
                 FROM medias
                 WHERE id = ?`;
		const params = [id];
		const result = await DBService.query(sql, params);
		if (result.length > 0) {
			return result[0].infomaniak_id;
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