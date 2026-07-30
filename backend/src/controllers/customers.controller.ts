import type { Request, Response } from "express";
import * as customerService from "../services/customer.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await customerService.listCustomers());
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await customerService.getCustomer(param(req)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await customerService.createCustomer(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await customerService.updateCustomer(param(req), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await customerService.deleteCustomer(param(req));
  res.status(204).end();
});


