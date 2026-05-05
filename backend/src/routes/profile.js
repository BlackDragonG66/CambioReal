import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getProfile } from "../controllers/profileController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getProfile);

export default router;
