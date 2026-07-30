import type { Request, Response } from "express";
import * as bookingService from "../services/booking.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await bookingService.listBookings());
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await bookingService.getBooking(param(req)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await bookingService.createBooking(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await bookingService.updateBooking(param(req), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await bookingService.deleteBooking(param(req));
  res.status(204).end();
});


