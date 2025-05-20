import PlayerService from "./PlayerService.js";
import {infomaniak} from "../configs/config.js";
import {DateTime} from "luxon";
import fetch from "node-fetch";
import FormData from "form-data";
import {PassThrough} from "stream";

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
		const headers = {
			"Authorization": `Bearer ${infomaniak.apiKey}`,
			"Content-Type": "application/json"
		}
		const response = await fetch(url, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
			redirect: "follow"
		});
		if (!response.ok) {
			console.error(response);
			throw new Error("Failed to generate embed URL");
		}
		const token = (await response.json()).data;
		return "https://player.vod2.infomaniak.com/embed/" + shareId + "?" + token;
	}
	
	static getUploadData() {
		return {
			"url": `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/upload`,
			"headers": {
				"Authorization": `Bearer ${infomaniak.apiKey}`,
			},
		}
	}

	static async publishMedia(mediaId) {
		const publishUrl = `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/media/${mediaId}`;
		const headers = {
			Authorization: `Bearer ${infomaniak.apiKey}`,
			Authorization: `Bearer ${infomaniak.apiKey}`,
			"Content-Type": "application/json",
		};
		const body = {published: 1};

		const response = await fetch(publishUrl, {
			method: "PUT",
			headers,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Error publishing file: ${response.status} ${response.statusText} - ${error}`);
		}
	}

	static async waitForEncoding(mediaId) {
		const checkUrl = `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/media/${mediaId}`;
		const headers = {
			Authorization: `Bearer ${infomaniak.apiKey}`,
		};

		while (true) {
			await new Promise(resolve => setTimeout(resolve, 5000));
			const response = await fetch(checkUrl, {headers});
			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Error checking encoding status: ${response.status} ${response.statusText} - ${error}`);
			}

			const responseData = await response.json();
			if (responseData.data.encoded_medias.length > 0) {
				break;
			}
		}
	}

	static async createShare(mediaId) {
		const shareUrl = `https://api.infomaniak.com/1/vod/channel/${infomaniak.channelId}/share`;
		const headers = {
			Authorization: `Bearer ${infomaniak.apiKey}`,
			"Content-Type": "application/json",
		};
		const body = {
			target: mediaId,
			player: infomaniak.playerId,
		};

		const response = await fetch(shareUrl, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Error creating share: ${response.status} ${response.statusText} - ${error}`);
		}

		const responseData = await response.json();
		return responseData.data.id;
	}
}