import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getBalance, getHistory } from "../controllers/pointsController.js";

const router = Router();

router.use(authMiddleware);

router.get("/balance", getBalance);
router.get("/history", getHistory);

export default router;
