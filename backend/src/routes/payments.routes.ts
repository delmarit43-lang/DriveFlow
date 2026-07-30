import { Router } from "express";
import * as paymentsController from "../controllers/payments.controller.js";
import { validate } from "../middleware/validate.js";
import { createPaymentSchema, updatePaymentSchema } from "../validators/module.schemas.js";

const router = Router();

router.get("/", paymentsController.list);
router.get("/:id", paymentsController.getById);
router.post("/", validate(createPaymentSchema), paymentsController.create);
router.patch("/:id", validate(updatePaymentSchema), paymentsController.update);
router.delete("/:id", paymentsController.remove);

export default router;
