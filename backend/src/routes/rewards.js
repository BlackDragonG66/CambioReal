import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { listRewards, createReward, redeemReward, deleteReward } from "../controllers/rewardsController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listRewards);
router.post("/", createReward);
router.post("/:id/redeem", redeemReward);
router.delete("/:id", deleteReward);

export default router;
