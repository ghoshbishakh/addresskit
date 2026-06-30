import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";
import { loadMetadata, getCountries } from "@addresskit/data";

export function createLibaddressinputProvider(): AddressProvider {
  const cache = new Map<string, CountryAddressConfig>();

  return {
    async getCountries() {
      // Backed by a bundled index; avoids loading all per-country metadata.
      return getCountries();
    },

    async getStates(country: string) {
      const metadata = await this.getMetadata(country);
      return metadata.subRegions ?? [];
    },

    async getCities(_country: string, _state: string) {
      return [];
    },

    async getMetadata(country: string): Promise<CountryAddressConfig> {
      if (cache.has(country)) return cache.get(country)!;
      const metadata = await loadMetadata(country);
      cache.set(country, metadata);
      return metadata;
    },
  };
}
