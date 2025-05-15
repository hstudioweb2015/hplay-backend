import DBService from "./DBService.js";
import crypto from "crypto";
import MediaService from "./MediaService.js";
import PaymentError from "../errors/PaymentError.js";

export default class PaymentService {
	/**
	 * Create a new payment
	 * @param medias {Array} - The list of media IDs to be paid for
	 * @param redirectUrl {string} - The URL to redirect to after payment
	 * @param user {Object} - The user making the payment
	 * @returns {Promise<{url: string}>} - The URL for the payment
	 */
	static async createPayment({medias, redirectUrl}, user) {
		const totalPrice = await this.getTotalPrice(medias);
		if (totalPrice === 0) {
			await MediaService.addMediasToUser(medias, user.id);
			return {
				url: redirectUrl + "?status=success",
			}
		}
		const referenceId = await this.createPaymentInDatabase(medias, user.id);
		const description = await this.createPaymentDescription(medias);
		const paylink = await this.createPaylink(referenceId, totalPrice, description, redirectUrl);
		return {
			url: paylink,
		};
	}

	/**
	 * Update the payment status in the database
	 * @param transaction {Object} - The transaction object containing payment details
	 * @returns {Promise<{status: string, message: string}>} - The status and message of the update
	 */
	static async updatePayment({transaction}) {
		const {referenceId, status} = transaction;
		let isPaid = status === "confirmed";
		const payment = await this.getPaymentByReferenceId(referenceId);
		const userId = payment.users_id;
		const actualPayStatus = payment.is_paid;
		if (isPaid != actualPayStatus) {
			await this.updatePaymentIsPaid(referenceId, isPaid);
			const medias = await MediaService.getMediasIdByReferenceId(referenceId);
			if (isPaid) {
				await MediaService.addMediasToUser(medias, userId);
				return {
					status: "success",
					message: "Payment is successful comfirmed",
				}
			} else {
				await MediaService.removeMediasToUser(medias, userId);
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
		const referenceId = await this.generateReferenceId();
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
			const sql = `SELECT price
                   FROM medias
                   WHERE id = ?`;
			const params = [mediaId];
			const result = await DBService.query(sql, params);
			if (result.length > 0) {
				totalPrice += result[0].price;
			}
		}
		return totalPrice;
	}

	/**
	 * Create a payment description
	 * @param medias {Array} - The list of media IDs
	 * @returns {Promise<string>} - The payment description
	 */
	static async createPaymentDescription(medias) {
		let description = "";
		for (const mediaId of medias) {
			const sql = `SELECT name, price
                   FROM medias
                   WHERE id = ?`;
			const params = [mediaId];
			const result = await DBService.query(sql, params);
			if (result.length > 0) {
				description += result[0].name + " - " + result[0].price / 100 + " CHF \n";
			}
		}
		return description.slice(0, -2);
	}

	/**
	 * Generate a unique reference ID for the payment
	 * @returns {Promise<string>} - The generated reference ID
	 */
	static async generateReferenceId() {
		const sql = `SELECT COUNT(*) as count
                 FROM payments
                 WHERE reference_id = ?`;
		while (true) {
			const referenceId = crypto.randomBytes(16).toString("hex");
			const params = [referenceId];
			const result = await DBService.query(sql, params);
			if (parseInt(result[0].count) === 0) {
				return referenceId;
			}
		}
	}

	/**
	 * Get a payment by reference ID
	 * @param referenceId {string} - The reference ID of the payment
	 * @returns {Promise<Object>} - The payment object
	 */
	static async getPaymentByReferenceId(referenceId) {
		const sql = `SELECT users_id, is_paid
                 FROM payments
                 WHERE reference_id = ?`;
		const params = [referenceId];
		const result = await DBService.query(sql, params);
		if (result.length > 0) {
			return result[0];
		} else {
			throw new PaymentError(`No payment found for reference_id: ${referenceId}`);
		}
	}

	/**
	 * Update the payment status in the database
	 * @param referenceId {string} - The reference ID of the payment
	 * @param isPaid {boolean} - The payment status
	 * @returns {Promise<void>} - The updated payment object
	 */
	static async updatePaymentIsPaid(referenceId, isPaid) {
		const sql = `UPDATE payments
                 SET is_paid = ?
                 WHERE reference_id = ?`;
		const params = [isPaid, referenceId];
		await DBService.query(sql, params);
	}

	/**
	 * Create a payment link using Zahls API
	 * @param referenceId {string} - The reference ID of the payment
	 * @param totalPrice {number} - The total price of the payment
	 * @param description {string} - The payment description
	 * @param redirectUrl {string} - The URL to redirect to after payment
	 * @returns {Promise<string>} - The payment link
	 */
	static async createPaylink(referenceId, totalPrice, description, redirectUrl) {
		throw new PaymentError(`createPaylink method not implemented`);
	}
}