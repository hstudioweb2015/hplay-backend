import express from "express";
import MediaController from "../controllers/MediaController.js";
import validateRequest from "../middlewares/validateRequest.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

// Search for medias
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

// Get media by id
router.get("/:id",
		authenticateToken,
		validateRequest({
			id: {type: "string", required: true},
		}),
		MediaController.getMediaById
);

// Request a url with unique token to play a media
router.get("/:id/play",
		authenticateToken,
		validateRequest({
			id: {type: "string", required: true},
		}),
		MediaController.playMedia
);

export default router;