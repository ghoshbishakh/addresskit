import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useAddressProvider,
  AddressProviderContext,
  defaultProvider,
} from "../context";
import type { AddressProvider } from "@addresskit/core";

const mockProvider: AddressProvider = {
  async getCountries() {
    return [{ code: "US", name: "United States" }];
  },
  async getStates() {
    return [];
  },
  async getCities() {
    return [];
  },
  async getMetadata() {
    throw new Error("not implemented");
  },
};

describe("useAddressProvider with context", () => {
  it("returns custom provider from context", () => {
    const { result } = renderHook(() => useAddressProvider(), {
      wrapper: ({ children }) => (
        <AddressProviderContext.Provider value={mockProvider}>
          {children}
        </AddressProviderContext.Provider>
      ),
    });
    expect(result.current).toBe(mockProvider);
  });
});

describe("useAddressProvider without context", () => {
  it("returns default bundled provider when context is missing", () => {
    const { result } = renderHook(() => useAddressProvider());
    expect(result.current).toBe(defaultProvider);
  });
});
