import type {
  Address,
  CountryAddressConfig,
  ValidationError,
  ValidationResult,
  ValidationOptions,
} from "./types";

function toPostalCodeRegex(pattern: string): RegExp {
  const body = pattern.replace(/^\^+/, "").replace(/\$+$/, "");
  return new RegExp(`^(?:${body})$`);
}

function matchSubRegion(
  subRegions: { name: string; code: string }[],
  value: string,
): boolean {
  const normalized = value.trim().toLowerCase();
  return subRegions.some(
    (r) =>
      r.code.toLowerCase() === normalized ||
      r.name.toLowerCase() === normalized,
  );
}

function validateAddressConfig(
  config: CountryAddressConfig,
  address: Address,
  options?: ValidationOptions,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!address.country || address.country.trim().length === 0) {
    errors.push({ field: "country", message: "Country is required" });
  }

  for (const field of config.requiredFields) {
    const value = address[field as keyof Address];
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      const label = config.fieldLabels[field] ?? field;
      errors.push({ field, message: `${label} is required` });
    }
  }

  if (address.postalCode && config.postalCodePattern) {
    const trimmedPostal = address.postalCode.trim();
    if (!toPostalCodeRegex(config.postalCodePattern).test(trimmedPostal)) {
      const label = config.fieldLabels.postalCode ?? "postal code";
      errors.push({
        field: "postalCode",
        message: `Invalid ${label} format`,
      });
    }
  }

  if (
    address.administrativeArea &&
    config.subRegions &&
    config.subRegions.length > 0 &&
    !options?.allowUnknownSubregions
  ) {
    if (!matchSubRegion(config.subRegions, address.administrativeArea)) {
      errors.push({
        field: "administrativeArea",
        message: `Invalid ${config.administrativeAreaType}`,
      });
    }
  }

  if (options?.customValidators) {
    for (const validator of options.customValidators) {
      const result = validator(address, config);
      if (Array.isArray(result)) {
        errors.push(...result);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

async function validateAddressConfigAsync(
  config: CountryAddressConfig,
  address: Address,
  options?: ValidationOptions,
): Promise<ValidationResult> {
  const syncResult = validateAddressConfig(config, address, options);
  const errors = [...syncResult.errors];

  if (options?.customValidators) {
    for (const validator of options.customValidators) {
      const result = validator(address, config);
      if (result instanceof Promise) {
        const asyncErrors = await result;
        if (Array.isArray(asyncErrors)) {
          errors.push(...asyncErrors);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export {
  toPostalCodeRegex,
  validateAddressConfig,
  validateAddressConfigAsync,
};
