import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err.message === "VALIDATION_ERROR") {
    return res.status(400).json({
      message: "Invalid request data",
      errors: err.issues,
    });
  }

  if (err.message === "UNAUTHORIZED") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Will implement more specific error handling later
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }

  // Unknown errors
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}