import express from "express";
import MediaController from "../controllers/MediaController.js";
import validateRequest from "../middlewares/validateRequest.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import adminSecurity from "./../middlewares/adminSecurity.js";

const router = express.Router();

// Search for medias
router.post("/search",
		validateRequest({
			name: {type: "string", required: false},
			limit: {type: "number", required: false},
			page: {type: "number", required: false},
			tags: {type: "object", required: false},
			userId: {type: "number", required: false},
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

router.post("/",
		authenticateToken,
		adminSecurity,
		validateRequest({
			name: {type: "string", required: true},
			description: {type: "string", required: true},
			price: {type: "number", required: true},
			tags: {type: "object", required: true},
			available: {type: "boolean", required: false},
		}),
		MediaController.createMedia
)

router.post(":id/upload",
		authenticateToken,
		adminSecurity,
		MediaController.uploadMedia
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