import { createContext, useContext } from "react";
import type { AddressProvider } from "@addresskit/core";

const AddressProviderContext = createContext<AddressProvider | null>(null);

export { AddressProviderContext };

export function useAddressProvider(): AddressProvider {
  const provider = useContext(AddressProviderContext);
  if (!provider) {
    throw new Error("useAddressProvider must be used within <AddressProviderContext.Provider>");
  }
  return provider;
}
