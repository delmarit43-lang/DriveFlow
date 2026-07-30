import type { Request, Response } from "express";
import * as paymentService from "../services/payment.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await paymentService.listPayments());
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await paymentService.getPayment(param(req)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await paymentService.createPayment(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await paymentService.updatePayment(param(req), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await paymentService.deletePayment(param(req));
  res.status(204).end();
});


