import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useCountries,
  useStates,
  useAddressForm,
  AddressProviderContext,
} from "../index";
import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";

const usConfig: CountryAddressConfig = {
  code: "US",
  name: "United States",
  format: "%A%n%C, %S %Z",
  requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
  fieldLabels: {
    line1: "Street Address",
    locality: "City",
    administrativeArea: "State",
    postalCode: "ZIP Code",
  },
  fieldPlaceholders: {},
  postalCodePattern: "^\\d{5}$",
  administrativeAreaType: "state",
  localityType: "city",
  subRegions: [{ code: "CA", name: "California" }],
};

const mockProvider: AddressProvider = {
  async getCountries() {
    return [
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
    ];
  },
  async getStates(country: string) {
    if (country === "US") return usConfig.subRegions ?? [];
    return [];
  },
  async getCities() {
    return ["San Jose", "Los Angeles"];
  },
  async getMetadata(country: string) {
    if (country === "US") return usConfig;
    if (country === "CA") {
      return {
        ...usConfig,
        code: "CA",
        name: "Canada",
        requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
        fieldLabels: { administrativeArea: "Province", postalCode: "Postal Code" },
        subRegions: [{ code: "ON", name: "Ontario" }],
      };
    }
    throw new Error("not found");
  },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AddressProviderContext.Provider value={mockProvider}>
    {children}
  </AddressProviderContext.Provider>
);

describe("useCountries hook", () => {
  it("loads country list from provider", async () => {
    const { result } = renderHook(() => useCountries(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe("useCountries with allowedCountries", () => {
  it("filters countries by allowed list", async () => {
    const { result } = renderHook(() => useCountries(["US"]), { wrapper });

    await waitFor(() => {
      expect(result.current.countries.length).toBe(1);
    });
  });
});

describe("useStates hook", () => {
  it("loads states for selected country", async () => {
    const { result } = renderHook(() => useStates("US"), { wrapper });

    await waitFor(() => {
      expect(result.current.states.length).toBe(1);
    });
  });
});

describe("useAddressForm headless hook", () => {
  it("initializes with initial address values", () => {
    const { result } = renderHook(
      () =>
        useAddressForm({
          initialAddress: { country: "US", line1: "123 Main St" },
        }),
      { wrapper },
    );

    expect(result.current.address.line1).toBe("123 Main St");
  });
});

describe("useAddressForm setFieldValue", () => {
  it("updates individual field values correctly", () => {
    const { result } = renderHook(
      () => useAddressForm({ initialAddress: { country: "US" } }),
      { wrapper },
    );

    act(() => {
      result.current.setFieldValue("line1", "456 Market St");
    });

    expect(result.current.address.line1).toBe("456 Market St");
  });
});

describe("useAddressForm setCountry", () => {
  it("updates country and cascades invalid values", () => {
    const { result } = renderHook(
      () =>
        useAddressForm({
          initialAddress: {
            country: "US",
            line1: "123 Main St",
            locality: "San Jose",
          },
        }),
      { wrapper },
    );

    act(() => {
      result.current.setCountry("CA");
    });

    expect(result.current.address.locality).toBeUndefined();
  });
});
