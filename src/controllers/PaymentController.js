import PaymentService from "../services/PaymentService.js";

export default class PaymentController {
	
	static async createPayment(req, res, next) {
		try {
			const response = await PaymentService.createPayment(req.body, req.user);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}
	
	static async updatePayment(req, res, next) {
		try {
			const response = await PaymentService.updatePayment(req.body);
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	}
}