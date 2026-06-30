import type { AddressProvider, Address, AddressSchema, ValidationResult, CountryAddressConfig } from "./types";
import { buildSchema } from "./schema";
import { validateAddressConfig } from "./validate";
import { formatAddress } from "./format";

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
    return buildSchema(await loadMetadata(country));
  }

  async function validate(address: Address): Promise<ValidationResult> {
    return validateAddressConfig(await loadMetadata(address.country), address);
  }

  /**
   * Format an address into a postal string. Loads the country metadata on
   * demand, so callers no longer need to prime the cache via `validate`/
   * `getSchema` first.
   */
  async function format(address: Address): Promise<string> {
    return formatAddress(await loadMetadata(address.country), address);
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

  return {
    getSchema,
    validate,
    format,
    clearInvalidValues,
    clearState,
  };
}

export type Engine = ReturnType<typeof createEngine>;
