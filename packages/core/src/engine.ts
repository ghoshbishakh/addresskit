import type { AddressProvider, Address, AddressSchema, ValidationResult, ValidationError, CountryAddressConfig, FieldId } from "./types";
import { buildSchema } from "./schema";

export function createEngine(provider: AddressProvider) {
  const cache = new Map<string, CountryAddressConfig>();

  async function loadMetadata(country: string): Promise<CountryAddressConfig> {
    const cached = cache.get(country);
    if (cached) return cached;
    const metadata = await provider.getMetadata(country);
    cache.set(country, metadata);
    return metadata;
  }

  async function getSchema(country: string): Promise<AddressSchema> {
    const metadata = await loadMetadata(country);
    return buildSchema(metadata);
  }

  async function validate(address: Address): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const metadata = await loadMetadata(address.country);

    for (const field of metadata.requiredFields) {
      const value = address[field as keyof Address];
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        const label = metadata.fieldLabels[field] ?? field;
        errors.push({
          field,
          message: `${label} is required`,
        });
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

  function format(address: Address): string {
    const metadata = cache.get(address.country);
    if (!metadata) return "";

    let result = metadata.format;

    const upper = metadata.upperFields ?? [];

    const replacements: Record<string, string | undefined> = {
      "%N": "",
      "%O": "",
      "%A": [address.line1, address.line2].filter(Boolean).join(", "),
      "%D": "",
      "%C": address.locality,
      "%S": address.administrativeArea,
      "%Z": address.postalCode,
      "%X": "",
    };

    for (const [token, value] of Object.entries(replacements)) {
      const val = value ?? "";
      const field = tokenToField(token);
      const finalVal = field && upper.includes(field) ? val.toUpperCase() : val;
      result = result.replace(token, finalVal);
    }

    return result
      .replace(/%n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .replace(/,\s*,/g, ",")
      .replace(/^[,\s]+|[,\s]+$/g, "")
      .trim();
  }

  function clearInvalidValues(
    address: Address,
    prevCountry: string | null,
    newCountry: string,
  ): Partial<Address> {
    if (prevCountry === newCountry || !prevCountry) {
      return { country: newCountry };
    }

    const result: Partial<Address> = { country: newCountry };

    if (address.line1) result.line1 = address.line1;
    if (address.line2) result.line2 = address.line2;

    return result;
  }

  function clearState(address: Address): Partial<Address> {
    const result: Partial<Address> = {
      country: address.country,
      line1: address.line1,
      line2: address.line2,
      locality: address.locality,
    };

    return result;
  }

  return {
    getSchema,
    validate,
    format,
    clearInvalidValues,
    clearState,
  };
}

function tokenToField(token: string): FieldId | null {
  switch (token) {
    case "%A":
      return "line1";
    case "%C":
      return "locality";
    case "%S":
      return "administrativeArea";
    case "%Z":
      return "postalCode";
    default:
      return null;
  }
}

export type Engine = ReturnType<typeof createEngine>;
