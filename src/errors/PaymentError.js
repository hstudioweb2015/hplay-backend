import AppError from "./AppError.js";

export default class PaymentError extends AppError {
	constructor(messages, status = 400) {
		super("Payment operation failed.", messages, status);
		this.name = "PaymentError";
	}
}