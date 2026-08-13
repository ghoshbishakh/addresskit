import { describe, it, expect } from "vitest";
import { normalizeAddress } from "../normalize";
import type { CountryAddressConfig } from "../types";

const usConfig: CountryAddressConfig = {
  code: "US",
  name: "United States",
  format: "%A%n%C, %S %Z",
  requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
  fieldLabels: { postalCode: "ZIP Code" },
  fieldPlaceholders: {},
  postalCodePattern: "\\d{5}",
  administrativeAreaType: "state",
  localityType: "city",
  upperFields: ["administrativeArea"],
  subRegions: [
    { code: "CA", name: "California" },
    { code: "NY", name: "New York" },
  ],
};

describe("normalizeAddress trims whitespace", () => {
  it("trims line1 and locality", () => {
    const result = normalizeAddress(usConfig, {
      country: " us ",
      line1: "  123 Main St  ",
      locality: "  Los Angeles  ",
    });
    expect(result.line1).toBe("123 Main St");
  });
});

describe("normalizeAddress upper cases country", () => {
  it("converts lowercase country code to uppercase", () => {
    const result = normalizeAddress(usConfig, {
      country: "us",
      line1: "123 Main St",
    });
    expect(result.country).toBe("US");
  });
});

describe("normalizeAddress upper cases upperFields", () => {
  it("uppercases state code", () => {
    const result = normalizeAddress(usConfig, {
      country: "US",
      line1: "123 Main St",
      administrativeArea: "ca",
    });
    expect(result.administrativeArea).toBe("CA");
  });
});

describe("normalizeAddress canonicalizes subregion names to code", () => {
  it("converts full subregion name to code", () => {
    const result = normalizeAddress(usConfig, {
      country: "US",
      line1: "123 Main St",
      administrativeArea: "California",
    });
    expect(result.administrativeArea).toBe("CA");
  });
});
