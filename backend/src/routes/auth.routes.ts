import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  changePasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
} from "../validators/auth.schemas.js";
import { forgotPasswordSchema, resetPasswordSchema } from "../validators/module.schemas.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts. Try again later." },
});

const router = Router();

router.use(authLimiter);

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", validate(logoutSchema), authController.logout);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.get("/profile", requireAuth, authController.profile);
router.patch("/profile", requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.patch(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;
