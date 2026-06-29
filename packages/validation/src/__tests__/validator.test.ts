import { describe, it, expect } from "vitest";
import { createValidator } from "../validator";
import type { AddressProvider, Address } from "@addresskit/core";

const testProvider: AddressProvider = {
  async getCountries() {
    return [];
  },
  async getStates() {
    return [];
  },
  async getCities() {
    return [];
  },
  async getMetadata(_country: string) {
    return {
      code: "US",
      format: "%A%n%C, %S %Z",
      requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
      fieldLabels: { postalCode: "ZIP Code" },
      fieldPlaceholders: { postalCode: "90210" },
      postalCodePattern: "\\d{5}([-]\\d{4})?",
      administrativeAreaType: "state",
      localityType: "city",
      subRegions: [
        { code: "CA", name: "California" },
        { code: "NY", name: "New York" },
      ],
    };
  },
};

const validator = createValidator(testProvider);

describe("createValidator", () => {
  describe("validateAddress", () => {
    it("returns valid for complete address", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210",
      };
      const result = await validator.validateAddress(address);
      expect(result.valid).toBe(true);
    });

    it("returns errors for missing required fields", async () => {
      const address: Address = { country: "US", line1: "" };
      const result = await validator.validateAddress(address);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("validateField", () => {
    it("returns error message for invalid field", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "abc",
      };
      const error = await validator.validateField(address, "postalCode");
      expect(error).not.toBeNull();
    });

    it("returns null for valid field", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210",
      };
      const error = await validator.validateField(address, "postalCode");
      expect(error).toBeNull();
    });
  });
});
