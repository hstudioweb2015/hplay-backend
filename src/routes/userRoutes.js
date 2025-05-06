import express from "express";
import UserController from "../controllers/UserController.js";
import validateRequest from "../middlewares/validateRequest.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

router.post("/register",
		validateRequest({
			firstName: {type: "string", required: true},
			lastName: {type: "string", required: true},
			email: {type: "string", required: true, format: "email"},
			password: {type: "string", required: true, minLength: 6}
		}),
		UserController.createUser
);

router.post("/login",
		validateRequest({
			email: {type: "string", required: true, format: "email"},
			password: {type: "string", required: true, minLength: 6}
		}),
		UserController.loginUser
);

router.get("/:id",
		authenticateToken,
		validateRequest({
			id: {type: "string", required: true}
		}),
		UserController.getUserById
);

router.put("/:id",
		authenticateToken,
		validateRequest({
			id: {type: "string", required: true},
			firstName: {type: "string", required: true},
			lastName: {type: "string", required: true},
			email: {type: "string", required: true, format: "email"},
			password: {type: "string", required: false, minLength: 6}
		}),
		UserController.updateUser
);

router.delete("/:id",
		authenticateToken,
		validateRequest({
			id: {type: "string", required: true}
		}),
		UserController.deleteUser
);

export default router;