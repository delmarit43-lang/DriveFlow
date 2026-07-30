import type { Request, Response } from "express";
import * as driverService from "../services/driver.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await driverService.listDrivers());
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await driverService.getDriver(param(req)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await driverService.createDriver(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await driverService.updateDriver(param(req), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await driverService.deleteDriver(param(req));
  res.status(204).end();
});


