import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAddressProvider, AddressProviderContext } from "../context";
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

describe("useAddressProvider", () => {
  it("returns provider from context", () => {
    const { result } = renderHook(() => useAddressProvider(), {
      wrapper: ({ children }) => (
        <AddressProviderContext.Provider value={mockProvider}>
          {children}
        </AddressProviderContext.Provider>
      ),
    });
    expect(result.current).toBe(mockProvider);
  });

  it("throws without provider", () => {
    expect(() => {
      renderHook(() => useAddressProvider());
    }).toThrow("useAddressProvider must be used within");
  });
});
