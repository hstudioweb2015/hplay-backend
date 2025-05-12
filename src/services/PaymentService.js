import DBService from "./DBService.js";
import {zahls} from "../configs/config.js";
import crypto from "crypto";

export default class PaymentService {
	/**
	 * Create a new payment
	 * @param medias {Array} - The list of media IDs to be paid for
	 * @param user {Object} - The user making the payment
	 * @returns {Promise<{url}>} - The URL for the payment
	 */
	static async createPayment({medias}, user) {
		const referenceId = await PaymentService.createPaymentInDatabase(medias, user.id);
		const totalPrice = await PaymentService.getTotalPrice(medias);
		const description = await PaymentService.createPaymentDescription(medias);
		const url = `v1.0/Invoice?instance=${zahls.instanceId}`;
		const data = {
			title: "HPlay",
			description: description,
			referenceId: referenceId,
			purpose: "HPlay",
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
			throw new Error(`Error creating payment: ${error.message}`);
		}
		const responseData = await response.json();
		if (responseData.status !== "success") {
			throw new Error(`Error creating payment: ${responseData.message}`);
		}
		return {
			url : responseData.data[0].link
		};
	}


	static async updatePayment({transaction}) {
		const {referenceId, status} = transaction;
		let isPaid = status === "confirmed";
		const sql = `SELECT users_id, is_paid FROM payments WHERE reference_id = ?`;
		const params = [referenceId];
		const response = await DBService.query(sql, params);
		if (response.length === 0) {
			throw new Error("Payment not found");
		}
		const userId = response[0].users_id;
		const isAlreadyPaid = response[0].is_paid;
		if (isPaid != isAlreadyPaid) {
			const sqlUpdate = `UPDATE payments SET is_paid = ? WHERE reference_id = ?`;
			const paramsUpdate = [isPaid, referenceId];
			await DBService.query(sqlUpdate, paramsUpdate);
			const sqlMediaHasPayment = `SELECT medias_has_payments.medias_id FROM medias_has_payments
						INNER JOIN payments ON payments.id = medias_has_payments.payments_id
						WHERE payments.reference_id = ?`;
			const paramsMediaHasPayment = [referenceId];
			const medias = await DBService.query(sqlMediaHasPayment, paramsMediaHasPayment);
			if (isPaid) {
				const sqlMediaHasUser = `INSERT INTO medias_has_users (media_id, user_id) VALUES (?, ?)`;
				for (const media of medias) {
					const paramsMediaHasUser = [media.medias_id, userId];
					await DBService.query(sqlMediaHasUser, paramsMediaHasUser);
				}
				return {
					status: "success",
					message: "Payment is successful comfirmed",
				}
			} else {
				const sqlMediaHasUser = `DELETE
                                 FROM medias_has_users
                                 WHERE media_id = ?
                                   AND user_id = ?`;
				for (const media of medias) {
					const paramsMediaHasUser = [media.medias_id, userId];
					await DBService.query(sqlMediaHasUser, paramsMediaHasUser);
				}
				return {
					status: "success",
					message: "Payment is successfully canceled",
				}
			}
		}
		return {
			status: "success",
			message: "No changes made to the payment",
		};
	}


	/**
	 * Create a new payment in the database
	 * @param medias {Array} - The list of media IDs to be paid for
	 * @param userId {Number} - The ID of the user making the payment
	 * @returns {Promise<string>} - The reference ID of the payment
	 */
	static async createPaymentInDatabase(medias, userId) {
		const referenceId = await PaymentService.generateReferenceId();
		const sqlPayment = `INSERT INTO payments (reference_id, users_id)
										VALUES (?, ?)`;
		const paramsPayment = [referenceId, userId];
		const paymentId = await DBService.query(sqlPayment, paramsPayment, true);
		const sqlMediaHasPayment = `INSERT INTO medias_has_payments (medias_id, payments_id)
										VALUES (?, ?)`;
		for (const mediaId of medias) {
			const paramsMediaHasPayment = [mediaId, paymentId];
			await DBService.query(sqlMediaHasPayment, paramsMediaHasPayment);
		}
		return referenceId;
	}

	/**
	 * Get the total price of the media
	 * @param medias {Array} - The list of media IDs
	 * @returns {Promise<number>} - The total price of the media
	 */
	static async getTotalPrice(medias) {
		let totalPrice = 0;
		for (const mediaId of medias) {
			const sql = `SELECT price FROM medias WHERE id = ?`;
			const params = [mediaId];
			const result = await DBService.query(sql, params);
			if (result.length > 0) {
				totalPrice += result[0].price;
			}
		}
		return totalPrice;
	}
	
	static async createPaymentDescription(medias) {
		let description = "";
		for (const mediaId of medias) {
			const sql = `SELECT name, price FROM medias WHERE id = ?`;
			const params = [mediaId];
			const result = await DBService.query(sql, params);
			if (result.length > 0) {
				description += result[0].name + " - " + result[0].price / 100 + " CHF \n";
			}
		}
		return description.slice(0, -2);
	}
	
	static async generateReferenceId() {
		const sql = `SELECT COUNT(*) as count FROM payments WHERE reference_id = ?`;
		while (true) {
			const referenceId = crypto.randomBytes(16).toString("hex");
			const params = [referenceId];
			const result = await DBService.query(sql, params);
			if (parseInt(result[0].count) === 0) {
				return referenceId;
			}
		}
	}
}