import type { Request, Response } from "express";
import * as paymentMethodService from "../services/payment-method.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await paymentMethodService.listPaymentMethods());
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await paymentMethodService.createPaymentMethod(req.body));
});

export const setDefault = asyncHandler(async (req: Request, res: Response) => {
  res.json(await paymentMethodService.setDefaultPaymentMethod(param(req)));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await paymentMethodService.deletePaymentMethod(param(req));
  res.status(204).end();
});


