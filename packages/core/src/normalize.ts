import type { Address, CountryAddressConfig, NormalizeOptions } from "./types";

function cleanString(val?: string): string | undefined {
  if (val === undefined || val === null) return undefined;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeAddress(
  config: CountryAddressConfig,
  address: Address,
  options?: NormalizeOptions,
): Address {
  const trim = options?.trim !== false;
  const shouldUpper = options?.uppercaseFields !== false;
  const canonicalize = options?.canonicalizeSubregion !== false;

  const result: Address = {
    country: (trim ? address.country.trim() : address.country).toUpperCase(),
    line1: trim ? (cleanString(address.line1) ?? "") : address.line1,
  };

  if (address.line2 !== undefined) {
    const cleaned = trim ? cleanString(address.line2) : address.line2;
    if (cleaned) result.line2 = cleaned;
  }

  if (address.locality !== undefined) {
    const cleaned = trim ? cleanString(address.locality) : address.locality;
    if (cleaned) result.locality = cleaned;
  }

  if (address.administrativeArea !== undefined) {
    let cleaned = trim
      ? cleanString(address.administrativeArea)
      : address.administrativeArea;

    if (cleaned !== undefined && canonicalize && config.subRegions) {
      const target = cleaned.toLowerCase();
      const match = config.subRegions.find(
        (r) =>
          r.code.toLowerCase() === target ||
          r.name.toLowerCase() === target,
      );
      if (match) {
        cleaned = match.code;
      }
    }

    if (cleaned) result.administrativeArea = cleaned;
  }

  if (address.postalCode !== undefined) {
    const cleaned = trim ? cleanString(address.postalCode) : address.postalCode;
    if (cleaned) result.postalCode = cleaned;
  }

  if (shouldUpper && config.upperFields) {
    for (const field of config.upperFields) {
      const current = result[field as keyof Address];
      if (typeof current === "string") {
        (result as unknown as Record<string, string>)[field] = current.toUpperCase();
      }
    }
  }

  return result;
}

export { normalizeAddress };
