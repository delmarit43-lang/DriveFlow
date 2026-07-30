import { Router } from "express";
import * as driversController from "../controllers/drivers.controller.js";
import { validate } from "../middleware/validate.js";
import { createDriverSchema, updateDriverSchema } from "../validators/module.schemas.js";

const router = Router();

router.get("/", driversController.list);
router.get("/:id", driversController.getById);
router.post("/", validate(createDriverSchema), driversController.create);
router.patch("/:id", validate(updateDriverSchema), driversController.update);
router.delete("/:id", driversController.remove);

export default router;
