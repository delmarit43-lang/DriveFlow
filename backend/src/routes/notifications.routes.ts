import { Router } from "express";
import * as notificationsController from "../controllers/notifications.controller.js";
import { validate } from "../middleware/validate.js";
import { createNotificationSchema } from "../validators/module.schemas.js";

const router = Router();

router.get("/", notificationsController.list);
router.post("/", validate(createNotificationSchema), notificationsController.create);
router.post("/read-all", notificationsController.markAllRead);
router.patch("/:id/read", notificationsController.markRead);
router.delete("/:id", notificationsController.remove);

export default router;
