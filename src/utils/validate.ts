import { ZodType } from "zod";

export function validate<S extends ZodType<any, any, any>>(schema: S, data: unknown): S["_output"] {
  const result = schema.safeParse(data);

  if (!result.success) {
    const error = new Error("VALIDATION_ERROR");
    (error as any).issues = result.error.issues;
    throw error;
  }

  return result.data;
}