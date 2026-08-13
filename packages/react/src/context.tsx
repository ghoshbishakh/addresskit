import { createContext, useContext } from "react";
import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";
import { loadMetadata, getCountries } from "@addresskit/data";

const AddressProviderContext = createContext<AddressProvider | null>(null);

const cache = new Map<string, CountryAddressConfig>();

const defaultProvider: AddressProvider = {
  async getCountries() {
    return getCountries();
  },
  async getStates(country: string) {
    const metadata = await this.getMetadata(country);
    return metadata.subRegions ?? [];
  },
  async getCities() {
    return [];
  },
  async getMetadata(country: string): Promise<CountryAddressConfig> {
    const upper = country.toUpperCase();
    if (cache.has(upper)) return cache.get(upper)!;
    const metadata = await loadMetadata(upper);
    cache.set(upper, metadata);
    return metadata;
  },
};

function useAddressProvider(explicitProvider?: AddressProvider): AddressProvider {
  const ctxProvider = useContext(AddressProviderContext);
  return explicitProvider ?? ctxProvider ?? defaultProvider;
}

export { AddressProviderContext, useAddressProvider, defaultProvider };
