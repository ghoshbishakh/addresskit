import { z } from "zod";
import type { AddressProvider, ValidationOptions } from "@addresskit/core";
import { createValidator } from "@addresskit/validation";

interface AddressZodOptions {
  provider?: AddressProvider;
  validationOptions?: ValidationOptions;
}

const baseAddressShape = {
  country: z.string().min(1, "Country is required"),
  line1: z.string().min(1, "Street address is required"),
  line2: z.string().optional(),
  locality: z.string().optional(),
  administrativeArea: z.string().optional(),
  postalCode: z.string().optional(),
};

function createAddressZodSchema(options?: AddressZodOptions) {
  const validator = createValidator(options?.provider, options?.validationOptions);

  return z.object(baseAddressShape).superRefine(async (data, ctx) => {
    if (!data.country) return;

    const result = await validator.validateAddress(
      {
        country: data.country,
        line1: data.line1,
        line2: data.line2,
        locality: data.locality,
        administrativeArea: data.administrativeArea,
        postalCode: data.postalCode,
      },
      options?.validationOptions,
    );

    if (!result.valid) {
      for (const err of result.errors) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [err.field],
          message: err.message,
        });
      }
    }
  });
}

function addressZodSchema(options?: AddressZodOptions) {
  return createAddressZodSchema(options);
}

export { addressZodSchema, createAddressZodSchema };
export type { AddressZodOptions };
