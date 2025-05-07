import express from "express";
import MediaController from "../controllers/MediaController.js";
import validateRequest from "../middlewares/validateRequest.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

router.post("/search",
		authenticateToken,
		validateRequest({
			name: {type: "string", required: false},
			limit: {type: "number", required: false},
			page: {type: "number", required: false},
			tags: {type: "array", required: false},
		}),
		MediaController.searchMedia
);

router.get("/:id",
		authenticateToken,
		validateRequest({
			id: {type: "string", required: true},
		}),
		MediaController.getMediaById
);

router.get("/:id/play",
		authenticateToken,
		validateRequest({
			id: {type: "string", required: true},
		}),
		MediaController.playMedia
);

export default router;