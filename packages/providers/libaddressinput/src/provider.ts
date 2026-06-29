import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";
import { loadMetadata } from "@addresskit/data";

const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  JP: "Japan",
  AU: "Australia",
  BR: "Brazil",
};

export function createLibaddressinputProvider(): AddressProvider {
  return {
    async getCountries() {
      const codes = Object.keys(countryNames);
      return codes.map((code) => ({
        code,
        name: countryNames[code] ?? code,
      }));
    },

    async getStates(country: string) {
      const metadata = await loadMetadata(country);
      return metadata.subRegions ?? [];
    },

    async getCities(_country: string, _state: string) {
      return [];
    },

    async getMetadata(country: string): Promise<CountryAddressConfig> {
      return loadMetadata(country);
    },
  };
}
