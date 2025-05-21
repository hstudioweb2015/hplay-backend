import PlayerService from "./PlayerService.js";
import {infomaniak} from "../configs/config.js";
import {DateTime} from "luxon";
import fetch from "node-fetch";
import FormData from "form-data";
import {PassThrough} from "stream";
import * as url from "node:url";
import MediaError from "../errors/MediaError.js";

export default class InfomaniakService extends PlayerService {

	/**
	 * Generate an embed URL for the Infomaniak player
	 * @param shareId {String} - The share ID of the media
	 * @returns {Promise<string>}
	 */
	static async generateEmbedUrl(shareId) {
		const endTime = DateTime.fromMillis(
				Math.floor(Date.now()) + (infomaniak.tokenDuration * 60000),
				{zone: "Europe/Zurich"}
		).toFormat("yyyy-MM-dd HH:mm:ss");
		const url = `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/share/${shareId}/token`;
		const body = {
			"allowed_domains": [
				"https://player.vod2.infomaniak.com",
				"https://api.vod2.infomaniak.com",
				infomaniak.allowedDomain
			],
			"strategy": "HLS",
			"end_time": endTime,
		}

		const response = await this.query(url, "POST", body);
		const token = response.data;
		return "https://player.vod2.infomaniak.com/embed/" + shareId + "?" + token;
	}

	/**
	 * Upload a media file to Infomaniak
	 * @returns {Promise<Object>} - The url and headers for the upload
	 */
	static getUploadData() {
		return {
			"url": `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/upload`,
			"headers": {
				"Authorization": `Bearer ${infomaniak.apiKey}`,
			},
		}
	}

	/**
	 * Update the media to published state
	 * @param mediaId {String} - The ID of the media
	 * @returns {Promise<void>}
	 */
	static async publishMedia(mediaId) {
		const url = `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/media/${mediaId}`;
		const body = {published: 1};
		await this.query(url, "PUT", body);
	}

	/**
	 * Wait for the encoding to finish
	 * @param mediaId {String} - The ID of the media
	 * @returns {Promise<void>} - Resolves when encoding is started
	 */
	static async waitForEncoding(mediaId) {
		const url = `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/media/${mediaId}`;
		let tryCount = 0;
		while (true) {
			try {
				const response = await this.query(url);
				if (response.data.encoded_medias.length > 0) {
					break;
				}
				await new Promise(resolve => setTimeout(resolve, 5000));
			} catch (error) {
				if (error.message.includes("not found")) {
					throw new MediaError("Media not found", 404);
				}
				if (tryCount >= 5) {
					throw new Error("Encoding timeout");
				}
				tryCount++;
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}
	}

	/**
	 * Get the media information
	 * @param mediaId {String} - The ID of the media
	 * @returns {Promise<String>} - The thumbnail URL of the media
	 */
	static async getThumbnail(mediaId) {
		const url = `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/media/${mediaId}/thumbnail`;
		let tryCount = 0;
		while (true) {
			await new Promise(resolve => setTimeout(resolve, 5000));
			const response = await this.query(url, "GET");
			const thumbnail = response.data.link.url;

			// Check if the thumbnail url responds with a 200 status code
			const thumbnailResponse = await fetch(thumbnail);
			if (!thumbnailResponse.ok) {
				tryCount++;
				if (tryCount >= 5) {
					throw new MediaError("Thumbnail timeout", 500);
				}
			} else {
				return thumbnail;
			}
		}

	}

	static async createShare(mediaId) {
		const url = `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/share`;
		const body = {
			target: mediaId,
			player: infomaniak.playerId,
		};
		const response = await this.query(url, "POST", body);
		return response.data.id;
	}

	static async query(url, method = "GET", body = null) {
		const headers = {
			"Authorization": `Bearer ${infomaniak.apiKey}`,
			"Content-Type": "application/json",
		};
		const options = {
			method,
			headers,
		};
		if (body) {
			options.body = JSON.stringify(body);
		}
		const response = await fetch(url, options);
		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Error querying Infomaniak API: ${response.status} ${response.statusText} - ${error}`);
		}
		return await response.json();
	}
}