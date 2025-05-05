import express from "express";
import userRoutes from "./userRoutes.js";
import mediaRoutes from "./mediaRoutes.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/media", mediaRoutes);

export default router;