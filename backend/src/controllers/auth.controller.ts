import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import * as passwordResetService from "../services/password-reset.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body.email, req.body.password);
  res.json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.logoutUser(req.body.refreshToken);
  res.json(result);
});

export const profile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getProfile(req.user!.id);
  res.json(result);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.updateProfile(req.user!.id, req.body);
  res.json(result);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.changePassword(
    req.user!.id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  res.json(result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshSession(req.body.refreshToken);
  res.json(result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await passwordResetService.requestPasswordReset(req.body.email);
  res.json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await passwordResetService.resetPasswordWithToken(
    req.body.token,
    req.body.newPassword,
  );
  res.json(result);
});

