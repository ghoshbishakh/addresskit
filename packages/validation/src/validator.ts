import type { Address, AddressProvider, ValidationResult, ValidationError, FieldId } from "@addresskit/core";

export function createValidator(provider: AddressProvider) {
  async function validateAddress(address: Address): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const metadata = await provider.getMetadata(address.country);

    for (const field of metadata.requiredFields) {
      const value = address[field];
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        const label = metadata.fieldLabels[field] ?? field;
        errors.push({ field, message: `${label} is required` });
      }
    }

    if (address.postalCode && metadata.postalCodePattern) {
      const regex = new RegExp(`^${metadata.postalCodePattern}$`);
      if (!regex.test(address.postalCode)) {
        errors.push({
          field: "postalCode",
          message: `Invalid ${metadata.fieldLabels.postalCode ?? "postal code"} format`,
        });
      }
    }

    if (address.administrativeArea && metadata.subRegions) {
      const valid = metadata.subRegions.some((r) => r.code === address.administrativeArea);
      if (!valid) {
        errors.push({
          field: "administrativeArea",
          message: `Invalid ${metadata.administrativeAreaType}`,
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async function validateField(address: Address, field: FieldId): Promise<string | null> {
    const result = await validateAddress(address);
    const error = result.errors.find((e) => e.field === field);
    return error?.message ?? null;
  }

  return { validateAddress, validateField };
}

export type Validator = ReturnType<typeof createValidator>;
