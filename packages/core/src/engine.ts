import type {
  AddressProvider,
  Address,
  AddressSchema,
  ValidationResult,
  ValidationOptions,
  FormatOptions,
  NormalizeOptions,
  PostalLookupResult,
  CountryAddressConfig,
} from "./types";
import { buildSchema } from "./schema";
import { validateAddressConfigAsync } from "./validate";
import { formatAddress } from "./format";
import { normalizeAddress } from "./normalize";

function createEngine(provider: AddressProvider) {
  const cache = new Map<string, CountryAddressConfig>();

  async function loadMetadata(country: string): Promise<CountryAddressConfig> {
    const cached = cache.get(country);
    if (cached) return cached;
    const metadata = await provider.getMetadata(country);
    cache.set(country, metadata);
    return metadata;
  }

  async function getSchema(country: string): Promise<AddressSchema> {
    return buildSchema(await loadMetadata(country));
  }

  async function validate(
    address: Address,
    options?: ValidationOptions,
  ): Promise<ValidationResult> {
    const metadata = await loadMetadata(address.country);
    return validateAddressConfigAsync(metadata, address, options);
  }

  async function format(
    address: Address,
    options?: FormatOptions,
  ): Promise<string> {
    const metadata = await loadMetadata(address.country);
    return formatAddress(metadata, address, options);
  }

  async function normalize(
    address: Address,
    options?: NormalizeOptions,
  ): Promise<Address> {
    const metadata = await loadMetadata(address.country);
    return normalizeAddress(metadata, address, options);
  }

  async function lookupPostalCode(
    postalCode: string,
    country: string,
  ): Promise<PostalLookupResult | null> {
    if (provider.lookupPostalCode) {
      return provider.lookupPostalCode(postalCode, country);
    }
    return null;
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
    return {
      country: address.country,
      line1: address.line1,
      line2: address.line2,
      locality: address.locality,
    };
  }

  function clearCity(address: Address): Partial<Address> {
    return {
      country: address.country,
      line1: address.line1,
      line2: address.line2,
      administrativeArea: address.administrativeArea,
    };
  }

  return {
    getSchema,
    validate,
    format,
    normalize,
    lookupPostalCode,
    clearInvalidValues,
    clearState,
    clearCity,
  };
}

type Engine = ReturnType<typeof createEngine>;

export { createEngine };
export type { Engine };
