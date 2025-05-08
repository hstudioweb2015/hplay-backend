import express from "express";
import userRoutes from "./userRoutes.js";
import mediaRoutes from "./mediaRoutes.js";
import tagRoutes from "./tagRoutes.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/media", mediaRoutes);
router.use("/tag", tagRoutes);

export default router;