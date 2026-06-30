import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";
import { loadMetadata, getSupportedCountries } from "@addresskit/data";
import { loadCountries, loadStates } from "./data/loader";

function buildFallbackMetadata(code: string): CountryAddressConfig {
  return {
    code,
    format: "%line1%\\n%line2%\\n%locality% %administrativeArea% %postalCode%",
    requiredFields: ["line1", "locality", "postalCode"],
    fieldLabels: {},
    fieldPlaceholders: {},
    administrativeAreaType: "state",
    localityType: "city",
  };
}

export function createDr5hnProvider(): AddressProvider {
  return {
    async getCountries() {
      return loadCountries();
    },

    async getStates(country: string) {
      return loadStates(country);
    },

    async getCities(_country: string, _state: string) {
      return [];
    },

    async getMetadata(country: string): Promise<CountryAddressConfig> {
      const supported = getSupportedCountries();
      if (supported.includes(country)) {
        return loadMetadata(country);
      }
      return buildFallbackMetadata(country);
    },
  };
}
