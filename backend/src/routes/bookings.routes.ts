import { Router } from "express";
import * as bookingsController from "../controllers/bookings.controller.js";
import { validate } from "../middleware/validate.js";
import { createBookingSchema, updateBookingSchema } from "../validators/booking.schemas.js";

const router = Router();

router.get("/", bookingsController.list);
router.get("/:id", bookingsController.getById);
router.post("/", validate(createBookingSchema), bookingsController.create);
router.patch("/:id", validate(updateBookingSchema), bookingsController.update);
router.delete("/:id", bookingsController.remove);

export default router;
