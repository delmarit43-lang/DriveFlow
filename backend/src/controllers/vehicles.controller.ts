import type { Request, Response } from "express";
import * as vehicleService from "../services/vehicle.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await vehicleService.listVehicles());
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await vehicleService.getVehicle(param(req)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await vehicleService.createVehicle(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await vehicleService.updateVehicle(param(req), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await vehicleService.deleteVehicle(param(req));
  res.status(204).end();
});


