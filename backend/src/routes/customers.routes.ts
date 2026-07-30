import { Router } from "express";
import * as customersController from "../controllers/customers.controller.js";
import { validate } from "../middleware/validate.js";
import { createCustomerSchema, updateCustomerSchema } from "../validators/customer.schemas.js";

const router = Router();

router.get("/", customersController.list);
router.get("/:id", customersController.getById);
router.post("/", validate(createCustomerSchema), customersController.create);
router.patch("/:id", validate(updateCustomerSchema), customersController.update);
router.delete("/:id", customersController.remove);

export default router;
