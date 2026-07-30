import { Router } from "express";
import * as invoicesController from "../controllers/invoices.controller.js";
import { validate } from "../middleware/validate.js";
import { createInvoiceSchema, updateInvoiceSchema } from "../validators/module.schemas.js";

const router = Router();

router.get("/", invoicesController.list);
router.get("/:id", invoicesController.getById);
router.post("/", validate(createInvoiceSchema), invoicesController.create);
router.patch("/:id", validate(updateInvoiceSchema), invoicesController.update);
router.delete("/:id", invoicesController.remove);

export default router;
