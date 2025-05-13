import PaymentService from "./PaymentService.js";
import {zahls} from "../configs/config.js";

export default class ZahlsPaymentService extends PaymentService {
	/**
	 * Create a payment link using Zahls API
	 * @param referenceId {string} - The reference ID of the payment
	 * @param totalPrice {number} - The total price of the payment
	 * @param description {string} - The payment description
	 * @returns {Promise<string>} - The payment link
	 */
	static async createPaylink(referenceId, totalPrice, description) {
		const url = `v1.0/Invoice?instance=${zahls.instanceId}`;
		const data = {
			title: "HPlay",
			description: description,
			referenceId: referenceId,
			purpose: "Total",
			amount: totalPrice,
			vatRate: zahls.tva,
			currency: "CHF",
		}
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-KEY': zahls.apiKey,
			},
			body: JSON.stringify(data),
		};
		const response = await fetch(`https://api.zahls.ch/${url}`, options);
		if (!response.ok) {
			const error = await response.json();
			throw new Error(`Error creating payment link: ${error.message}`);
		}
		const responseData = await response.json();

		// The Zahls API returns always the status code 200, even if the request fails
		if (responseData.status !== "success") {
			throw new Error(`Error creating payment link: ${responseData.message}`);
		}
		return responseData.data[0].link;
	}
}