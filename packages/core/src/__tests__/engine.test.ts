import { describe, it, expect } from "vitest";
import { createEngine } from "../engine";
import type { AddressProvider, Address } from "../types";

const testProvider: AddressProvider = {
  async getCountries() {
    return [{ code: "US", name: "United States" }];
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
      upperFields: ["locality", "administrativeArea"],
      subRegions: [
        { code: "CA", name: "California" },
        { code: "NY", name: "New York" },
      ],
    };
  },
};

const engine = createEngine(testProvider);

describe("createEngine", () => {
  describe("getSchema", () => {
    it("returns schema with fields matching format", async () => {
      const schema = await engine.getSchema("US");
      expect(schema.fields.length).toBeGreaterThan(0);
      expect(schema.country).toBe("US");
    });
  });

  describe("validate", () => {
    it("returns valid for complete address", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210",
      };
      const result = await engine.validate(address);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns errors for missing required fields", async () => {
      const address: Address = { country: "US", line1: "" };
      const result = await engine.validate(address);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("returns error for invalid postal code", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "abc",
      };
      const result = await engine.validate(address);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "postalCode")).toBe(true);
    });

    it("returns error for invalid administrative area", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "XX",
        postalCode: "90210",
      };
      const result = await engine.validate(address);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "administrativeArea")).toBe(true);
    });

    it("accepts valid postal code format", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210-1234",
      };
      const result = await engine.validate(address);
      expect(result.valid).toBe(true);
    });
  });

  describe("format", () => {
    it("formats US address correctly", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        line2: "Apt 4",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210",
      };
      const formatted = await engine.format(address);
      expect(formatted).toContain("123 Main St");
      expect(formatted).toContain("LOS ANGELES");
      expect(formatted).toContain("90210");
    });

    it("resolves the administrative area code to its display name", async () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210",
      };
      const formatted = await engine.format(address);
      // upperFields includes administrativeArea, so "California" -> "CALIFORNIA".
      expect(formatted).toContain("CALIFORNIA");
    });

    it("loads metadata on demand without a prior validate/getSchema call", async () => {
      const freshEngine = createEngine(testProvider);
      const formatted = await freshEngine.format({
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "NY",
        postalCode: "10001",
      });
      expect(formatted).toContain("123 Main St");
      expect(formatted).toContain("NEW YORK");
    });
  });

  describe("clearInvalidValues", () => {
    it("clears locality, administrativeArea, and postalCode on country change", () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210",
      };
      const result = engine.clearInvalidValues(address, "US", "GB");
      expect(result.country).toBe("GB");
      expect(result.line1).toBe("123 Main St");
      expect(result.locality).toBeUndefined();
      expect(result.administrativeArea).toBeUndefined();
      expect(result.postalCode).toBeUndefined();
    });

    it("preserves all fields when country is unchanged", () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210",
      };
      const result = engine.clearInvalidValues(address, "US", "US");
      expect(result.country).toBe("US");
    });
  });

  describe("clearState", () => {
    it("clears administrative area on state change", () => {
      const address: Address = {
        country: "US",
        line1: "123 Main St",
        locality: "Los Angeles",
        administrativeArea: "CA",
        postalCode: "90210",
      };
      const result = engine.clearState(address);
      expect(result.administrativeArea).toBeUndefined();
      expect(result.locality).toBe("Los Angeles");
      expect(result.postalCode).toBeUndefined();
    });
  });
});
