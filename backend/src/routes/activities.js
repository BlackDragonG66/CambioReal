import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  listActivities,
  createActivity,
  completeActivity,
  updateActivity,
  deleteActivity
} from "../controllers/activitiesController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listActivities);
router.post("/", createActivity);
router.patch("/:id/complete", completeActivity);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

export default router;
