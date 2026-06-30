import { describe, it, expect } from "vitest";
import { toPostalCodeRegex, validateAddressConfig } from "../validate";
import type { CountryAddressConfig } from "../types";

describe("toPostalCodeRegex", () => {
  it("anchors an unanchored pattern", () => {
    const re = toPostalCodeRegex("\\d{5}");
    expect(re.test("90210")).toBe(true);
    expect(re.test("90210x")).toBe(false);
    expect(re.test("x90210")).toBe(false);
  });

  it("normalizes an already-anchored pattern (no double anchoring)", () => {
    const re = toPostalCodeRegex("^\\d{5}$");
    expect(re.source).toBe("^(?:\\d{5})$");
    expect(re.test("90210")).toBe(true);
    expect(re.test("9021")).toBe(false);
  });

  it("anchors an alternation as a whole", () => {
    const re = toPostalCodeRegex("AB|CD");
    expect(re.test("AB")).toBe(true);
    expect(re.test("CD")).toBe(true);
    expect(re.test("ABX")).toBe(false);
    expect(re.test("XCD")).toBe(false);
  });
});

describe("validateAddressConfig", () => {
  const config: CountryAddressConfig = {
    code: "US",
    format: "%A%n%C, %S %Z",
    requiredFields: ["line1", "postalCode"],
    fieldLabels: { postalCode: "ZIP Code" },
    fieldPlaceholders: {},
    postalCodePattern: "^\\d{5}$",
    administrativeAreaType: "state",
    localityType: "city",
    subRegions: [{ code: "CA", name: "California" }],
  };

  it("accepts a valid address whose postal code matches an anchored pattern", () => {
    const result = validateAddressConfig(config, {
      country: "US",
      line1: "123 Main St",
      administrativeArea: "CA",
      postalCode: "90210",
    });
    expect(result.valid).toBe(true);
  });

  it("flags an unknown administrative area", () => {
    const result = validateAddressConfig(config, {
      country: "US",
      line1: "123 Main St",
      administrativeArea: "ZZ",
      postalCode: "90210",
    });
    expect(result.errors.some((e) => e.field === "administrativeArea")).toBe(true);
  });
});
