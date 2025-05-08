import express from "express";
import TagController from "../controllers/TagController.js";
import validateRequest from "../middlewares/validateRequest.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import adminSecurity from "../middlewares/adminSecurity.js";

const router = express.Router();

// Get all tags
router.get("/",
		authenticateToken,
		TagController.getTags
);

// Search for tags
router.get("/:id",
		authenticateToken,
		validateRequest({
			id: {type: "string", required: true},
		}),
		TagController.getTagById
);

// Create a new tag
router.post("/",
		authenticateToken,
		adminSecurity,
		validateRequest({
			name: {type: "string", required: true},
		}),
		TagController.createTag
);

// Update a tag
router.put("/:id",
		authenticateToken,
		adminSecurity,
		validateRequest({
			id: {type: "string", required: true},
			name: {type: "string", required: true},
		}),
		TagController.updateTag
);

// Delete a tag
router.delete("/:id",
		authenticateToken,
		adminSecurity,
		validateRequest({
			id: {type: "string", required: true},
		}),
		TagController.deleteTag
);

export default router;