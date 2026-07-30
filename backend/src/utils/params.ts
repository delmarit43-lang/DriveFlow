import type { Request } from "express";

/** Express 5 typings allow `string | string[]` for params */
export function param(req: Request, name = "id"): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0]! : value!;
}
