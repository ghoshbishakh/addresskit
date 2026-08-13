import type {
  Address,
  AddressProvider,
  ValidationResult,
  ValidationOptions,
  NormalizeOptions,
  FormatOptions,
  PostalLookupResult,
  FieldId,
  CountryAddressConfig,
} from "@addresskit/core";
import {
  validateAddressConfigAsync,
  normalizeAddress as coreNormalizeAddress,
  formatAddress as coreFormatAddress,
} from "@addresskit/core";
import { loadMetadata } from "@addresskit/data";

interface ValidatorConfig {
  provider?: AddressProvider;
  defaultOptions?: ValidationOptions;
}

function createValidator(
  providerOrConfig?: AddressProvider | ValidatorConfig,
  defaultOptions?: ValidationOptions,
) {
  const provider =
    providerOrConfig && "getMetadata" in providerOrConfig
      ? providerOrConfig
      : (providerOrConfig as ValidatorConfig | undefined)?.provider;

  const resolvedOptions =
    defaultOptions ??
    (providerOrConfig && !("getMetadata" in providerOrConfig)
      ? (providerOrConfig as ValidatorConfig).defaultOptions
      : undefined);

  const cache = new Map<string, CountryAddressConfig>();

  async function resolveMetadata(country: string): Promise<CountryAddressConfig> {
    if (!country) {
      return {
        code: "",
        format: "%A%n%C, %S %Z",
        requiredFields: ["line1"],
        fieldLabels: {},
        fieldPlaceholders: {},
        administrativeAreaType: "state",
        localityType: "city",
      };
    }

    const uppercaseCountry = country.trim().toUpperCase();
    const cached = cache.get(uppercaseCountry);
    if (cached) return cached;

    let metadata: CountryAddressConfig;
    if (provider) {
      metadata = await provider.getMetadata(uppercaseCountry);
    } else {
      metadata = await loadMetadata(uppercaseCountry);
    }

    cache.set(uppercaseCountry, metadata);
    return metadata;
  }

  async function validateAddress(
    address: Address,
    options?: ValidationOptions,
  ): Promise<ValidationResult> {
    const opts = { ...resolvedOptions, ...options };
    const metadata = await resolveMetadata(address.country);
    return validateAddressConfigAsync(metadata, address, opts);
  }

  async function validateField(
    address: Address,
    field: FieldId,
    options?: ValidationOptions,
  ): Promise<string | null> {
    const result = await validateAddress(address, options);
    const error = result.errors.find((e) => e.field === field);
    return error?.message ?? null;
  }

  async function normalizeAddress(
    address: Address,
    options?: NormalizeOptions,
  ): Promise<Address> {
    const metadata = await resolveMetadata(address.country);
    return coreNormalizeAddress(metadata, address, options);
  }

  async function formatAddress(
    address: Address,
    options?: FormatOptions,
  ): Promise<string> {
    const metadata = await resolveMetadata(address.country);
    return coreFormatAddress(metadata, address, options);
  }

  async function lookupPostalCode(
    postalCode: string,
    country: string,
  ): Promise<PostalLookupResult | null> {
    if (provider?.lookupPostalCode) {
      return provider.lookupPostalCode(postalCode, country);
    }
    return null;
  }

  return {
    validateAddress,
    validateField,
    normalizeAddress,
    formatAddress,
    lookupPostalCode,
  };
}

type Validator = ReturnType<typeof createValidator>;

const defaultValidator = createValidator();

function validateAddress(
  address: Address,
  options?: ValidationOptions,
): Promise<ValidationResult> {
  return defaultValidator.validateAddress(address, options);
}

function validateField(
  address: Address,
  field: FieldId,
  options?: ValidationOptions,
): Promise<string | null> {
  return defaultValidator.validateField(address, field, options);
}

function normalizeAddress(
  address: Address,
  options?: NormalizeOptions,
): Promise<Address> {
  return defaultValidator.normalizeAddress(address, options);
}

function formatAddress(
  address: Address,
  options?: FormatOptions,
): Promise<string> {
  return defaultValidator.formatAddress(address, options);
}

function lookupPostalCode(
  postalCode: string,
  country: string,
): Promise<PostalLookupResult | null> {
  return defaultValidator.lookupPostalCode(postalCode, country);
}

export {
  createValidator,
  validateAddress,
  validateField,
  normalizeAddress,
  formatAddress,
  lookupPostalCode,
};
export type { Validator, ValidatorConfig };
