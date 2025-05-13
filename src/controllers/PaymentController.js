import ZahlsPaymentService from "../services/ZahlsPaymentService.js";

export default class PaymentController {
	
	static async createPayment(req, res, next) {
		try {
			const response = await ZahlsPaymentService.createPayment(req.body, req.user);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}
	
	static async updatePayment(req, res, next) {
		try {
			const response = await ZahlsPaymentService.updatePayment(req.body);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}
}