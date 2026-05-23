import { ErrorRequestHandler, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    message: "Internal server error",
  });
};
