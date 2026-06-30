import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";
import { loadMetadata, getSupportedCountries } from "@addresskit/data";

export function createLibaddressinputProvider(): AddressProvider {
  const cache = new Map<string, CountryAddressConfig>();

  return {
    async getCountries() {
      const codes = getSupportedCountries();
      const all = await Promise.all(
        codes.map(async (code) => {
          const meta = await this.getMetadata(code);
          return { code, name: meta.name ?? code };
        })
      );
      return all;
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
