import { Router } from "express";
import * as maintenanceController from "../controllers/maintenance.controller.js";
import { validate } from "../middleware/validate.js";
import { createMaintenanceSchema, updateMaintenanceSchema } from "../validators/module.schemas.js";

const router = Router();

router.get("/", maintenanceController.list);
router.get("/:id", maintenanceController.getById);
router.post("/", validate(createMaintenanceSchema), maintenanceController.create);
router.patch("/:id", validate(updateMaintenanceSchema), maintenanceController.update);
router.post("/:id/complete", maintenanceController.complete);
router.delete("/:id", maintenanceController.remove);

export default router;
