import type { Request, Response } from "express";
import * as invoiceService from "../services/invoice.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await invoiceService.listInvoices());
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await invoiceService.getInvoice(param(req)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await invoiceService.createInvoice(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await invoiceService.updateInvoice(param(req), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await invoiceService.deleteInvoice(param(req));
  res.status(204).end();
});

