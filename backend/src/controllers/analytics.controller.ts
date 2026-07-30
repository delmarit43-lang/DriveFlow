import type { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await analyticsService.getDashboardSummary());
});

