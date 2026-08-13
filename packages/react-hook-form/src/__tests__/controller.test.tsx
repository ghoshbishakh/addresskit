import { describe, it, expect } from "vitest";
import { addressValidationRule } from "../controller";
import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";

const usConfig: CountryAddressConfig = {
  code: "US",
  name: "United States",
  format: "%A%n%C, %S %Z",
  requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
  fieldLabels: {
    line1: "Street address",
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
    return [{ code: "US", name: "United States" }];
  },
  async getStates() {
    return [{ code: "CA", name: "California" }];
  },
  async getCities() {
    return [];
  },
  async getMetadata() {
    return usConfig;
  },
};

describe("addressValidationRule valid address", () => {
  it("returns true for a complete valid address", async () => {
    const rule = addressValidationRule(mockProvider);
    const result = await rule({
      country: "US",
      line1: "123 Main St",
      locality: "San Jose",
      administrativeArea: "CA",
      postalCode: "95112",
    });
    expect(result).toBe(true);
  });
});

describe("addressValidationRule missing required field", () => {
  it("returns error message when required field is missing", async () => {
    const rule = addressValidationRule(mockProvider);
    const result = await rule({
      country: "US",
      line1: "",
      locality: "San Jose",
      administrativeArea: "CA",
      postalCode: "95112",
    });
    expect(typeof result === "string" && result.length > 0).toBe(true);
  });
});

describe("addressValidationRule invalid postal code", () => {
  it("returns error message for invalid postal code pattern", async () => {
    const rule = addressValidationRule(mockProvider);
    const result = await rule({
      country: "US",
      line1: "123 Main St",
      locality: "San Jose",
      administrativeArea: "CA",
      postalCode: "abcde",
    });
    expect(result).toContain("Invalid ZIP Code format");
  });
});
