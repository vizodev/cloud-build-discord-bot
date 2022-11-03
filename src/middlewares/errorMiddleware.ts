import { NextFunction, Request, Response } from "express";
import { ValidateError } from "@tsoa/runtime";
export function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  if (error instanceof ValidateError) {
    console.warn(
      `Caught Validation Error for ${req.path}:`,
      error.fields,
      req.body
    );
    return res.status(401).json({
      message: "Validation Failed",
      details: error?.fields,
    });
  }


  if (error instanceof Error) {
    return res.status(500).json({
      message: error?.message ?? "Internal server error",
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
  });
}
