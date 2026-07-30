import { Router } from "express";
import * as healthController from "../controllers/health.controller.js";
import { requireAuth } from "../middleware/auth.js";
import authRoutes from "./auth.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import customersRoutes from "./customers.routes.js";
import driversRoutes from "./drivers.routes.js";
import invoicesRoutes from "./invoices.routes.js";
import maintenanceRoutes from "./maintenance.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import paymentMethodsRoutes from "./payment-methods.routes.js";
import paymentsRoutes from "./payments.routes.js";
import vehiclesRoutes from "./vehicles.routes.js";

const v1 = Router();

v1.get("/health", healthController.health);
v1.use("/auth", authRoutes);

v1.use(requireAuth);
v1.use("/vehicles", vehiclesRoutes);
v1.use("/customers", customersRoutes);
v1.use("/bookings", bookingsRoutes);
v1.use("/drivers", driversRoutes);
v1.use("/payments", paymentsRoutes);
v1.use("/payment-methods", paymentMethodsRoutes);
v1.use("/invoices", invoicesRoutes);
v1.use("/maintenance", maintenanceRoutes);
v1.use("/notifications", notificationsRoutes);
v1.use("/analytics", analyticsRoutes);

export default v1;
