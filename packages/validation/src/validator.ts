import type { Address, AddressProvider, ValidationResult, FieldId } from "@addresskit/core";
import { validateAddressConfig } from "@addresskit/core";

/**
 * Standalone validator bound to a provider. Validation rules live in
 * `@addresskit/core` (`validateAddressConfig`); this wrapper only handles
 * metadata loading so there is a single source of truth.
 */
export function createValidator(provider: AddressProvider) {
  async function validateAddress(address: Address): Promise<ValidationResult> {
    const metadata = await provider.getMetadata(address.country);
    return validateAddressConfig(metadata, address);
  }

  async function validateField(address: Address, field: FieldId): Promise<string | null> {
    const result = await validateAddress(address);
    const error = result.errors.find((e) => e.field === field);
    return error?.message ?? null;
  }

  return { validateAddress, validateField };
}

export type Validator = ReturnType<typeof createValidator>;
