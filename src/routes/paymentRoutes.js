import express from "express";
import validateRequest from "../middlewares/validateRequest.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import PaymentController from "../controllers/PaymentController.js";

const router = express.Router();

router.post("/",
		authenticateToken,
		validateRequest({
			medias: {type: "object", required: true},
			redirectUrl: {type: "string", required: true},
		}),
		PaymentController.createPayment
);

router.post("/webhook",
		validateRequest({
			transaction: {type: "object", required: true}
		}),
		PaymentController.updatePayment
);
		

export default router;