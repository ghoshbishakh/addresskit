import type { Address, CountryAddressConfig, ValidationError, ValidationResult } from "./types";

/**
 * Normalize a stored postal-code pattern into a single, fully anchored RegExp.
 *
 * Source data is inconsistent: some patterns already include `^…$` anchors and
 * some do not. We strip any existing anchors and wrap the body in a single
 * `^(?:…)$` so matching is consistent regardless of the input form (and so an
 * alternation like `a|b` is anchored as a whole, not just its first branch).
 */
export function toPostalCodeRegex(pattern: string): RegExp {
  const body = pattern.replace(/^\^+/, "").replace(/\$+$/, "");
  return new RegExp(`^(?:${body})$`);
}

/**
 * Validate an address against a resolved country config. Pure and synchronous:
 * the engine and the `@addresskit/validation` package both delegate here so
 * there is a single source of truth for validation rules.
 */
export function validateAddressConfig(
  config: CountryAddressConfig,
  address: Address,
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const field of config.requiredFields) {
    const value = address[field as keyof Address];
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      const label = config.fieldLabels[field] ?? field;
      errors.push({ field, message: `${label} is required` });
    }
  }

  if (address.postalCode && config.postalCodePattern) {
    if (!toPostalCodeRegex(config.postalCodePattern).test(address.postalCode)) {
      errors.push({
        field: "postalCode",
        message: `Invalid ${config.fieldLabels.postalCode ?? "postal code"} format`,
      });
    }
  }

  if (address.administrativeArea && config.subRegions) {
    const valid = config.subRegions.some((r) => r.code === address.administrativeArea);
    if (!valid) {
      errors.push({
        field: "administrativeArea",
        message: `Invalid ${config.administrativeAreaType}`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
