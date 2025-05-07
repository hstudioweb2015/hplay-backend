import PlayerService from "./PlayerService.js";
import {infomaniak} from "../configs/config.js";
import {DateTime} from "luxon";

export default class InfomaniakPlayerService extends PlayerService {

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
}