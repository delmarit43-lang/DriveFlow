import type { Request, Response } from "express";
import * as notificationService from "../services/notification.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { param } from "../utils/params.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await notificationService.listNotifications(req.user?.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await notificationService.createNotification(req.body));
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  res.json(await notificationService.markRead(param(req), req.user?.id));
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  res.json(await notificationService.markAllRead(req.user?.id));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.deleteNotification(param(req), req.user?.id);
  res.status(204).end();
});


