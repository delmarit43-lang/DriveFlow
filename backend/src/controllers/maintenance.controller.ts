import type { Request, Response } from "express";
import * as maintenanceService from "../services/maintenance.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await maintenanceService.listMaintenance());
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await maintenanceService.getMaintenance(param(req)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await maintenanceService.createMaintenance(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await maintenanceService.updateMaintenance(param(req), req.body));
});

export const complete = asyncHandler(async (req: Request, res: Response) => {
  res.json(await maintenanceService.completeMaintenance(param(req)));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await maintenanceService.deleteMaintenance(param(req));
  res.status(204).end();
});


