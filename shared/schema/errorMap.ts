import { z } from "zod";

export const validationErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (
    issue.code === z.ZodIssueCode.invalid_type &&
    issue.received === "undefined"
  ) {
    return { message: "validation:required" };
  }
  return { message: ctx.defaultError };
};

export function setupValidationErrorMap() {
  z.setErrorMap(validationErrorMap);
}
