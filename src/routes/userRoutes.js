import express from "express";
import UserController from "../controllers/userController.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = express.Router();

router.post("/",
		validateRequest({
			firstName: {type: "string", required: true},
			lastName: {type: "string", required: true},
			email: {type: "string", required: true, format: "email"},
			password: {type: "string", required: true, minLength: 6}
		}),
		UserController.createUser
);

export default router;