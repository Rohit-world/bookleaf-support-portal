import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type ValidationSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push({
          type: "body",
          issues: result.error.issues,
        });
      } else {
        req.body = result.data as any;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push({
          type: "params",
          issues: result.error.issues,
        });
      } else {
        req.params = result.data as any;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push({
          type: "query",
          issues: result.error.issues,
        });
      } else {
        req.query = result.data as any;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
}
