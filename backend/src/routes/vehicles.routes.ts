import { Router } from "express";
import * as vehiclesController from "../controllers/vehicles.controller.js";
import { validate } from "../middleware/validate.js";
import { createVehicleSchema, updateVehicleSchema } from "../validators/vehicle.schemas.js";

const router = Router();

router.get("/", vehiclesController.list);
router.get("/:id", vehiclesController.getById);
router.post("/", validate(createVehicleSchema), vehiclesController.create);
router.patch("/:id", validate(updateVehicleSchema), vehiclesController.update);
router.delete("/:id", vehiclesController.remove);

export default router;
