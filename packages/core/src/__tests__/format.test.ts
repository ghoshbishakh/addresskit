import { describe, it, expect } from "vitest";
import { formatAddress } from "../format";
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
  subRegions: [{ code: "CA", name: "California" }],
};

describe("formatAddress multi-line", () => {
  it("formats into newline-separated address lines", () => {
    const formatted = formatAddress(usConfig, {
      country: "US",
      line1: "123 Main St",
      locality: "San Jose",
      administrativeArea: "CA",
      postalCode: "95112",
    });
    expect(formatted).toBe("123 Main St\nSan Jose, CALIFORNIA 95112");
  });
});

describe("formatAddress single-line", () => {
  it("formats into single line string", () => {
    const formatted = formatAddress(
      usConfig,
      {
        country: "US",
        line1: "123 Main St",
        locality: "San Jose",
        administrativeArea: "CA",
        postalCode: "95112",
      },
      { singleLine: true },
    );
    expect(formatted).toBe("123 Main St, San Jose, CALIFORNIA 95112");
  });
});

describe("formatAddress with country", () => {
  it("appends country name on single line", () => {
    const formatted = formatAddress(
      usConfig,
      {
        country: "US",
        line1: "123 Main St",
        locality: "San Jose",
        administrativeArea: "CA",
        postalCode: "95112",
      },
      { singleLine: true, includeCountry: true },
    );
    expect(formatted).toBe("123 Main St, San Jose, CALIFORNIA 95112, United States");
  });
});
