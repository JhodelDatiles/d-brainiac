import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validate =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.flattenError(result.error).fieldErrors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
