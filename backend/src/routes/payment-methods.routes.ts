import { Router } from "express";
import * as paymentMethodsController from "../controllers/payment-methods.controller.js";
import { validate } from "../middleware/validate.js";
import { createPaymentMethodSchema } from "../validators/module.schemas.js";

const router = Router();

router.get("/", paymentMethodsController.list);
router.post("/", validate(createPaymentMethodSchema), paymentMethodsController.create);
router.post("/:id/default", paymentMethodsController.setDefault);
router.delete("/:id", paymentMethodsController.remove);

export default router;
