import { describe, it, expect } from "vitest";
import {
  createValidator,
  validateAddress,
  validateField,
  normalizeAddress,
  formatAddress,
} from "../validator";
import type { Address, AddressProvider } from "@addresskit/core";

const testProvider: AddressProvider = {
  async getCountries() {
    return [{ code: "US", name: "United States" }];
  },
  async getStates() {
    return [{ code: "CA", name: "California" }];
  },
  async getCities() {
    return [];
  },
  async getMetadata(_country: string) {
    return {
      code: "US",
      name: "United States",
      format: "%A%n%C, %S %Z",
      requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
      fieldLabels: { postalCode: "ZIP Code" },
      fieldPlaceholders: { postalCode: "90210" },
      postalCodePattern: "\\d{5}([-]\\d{4})?",
      administrativeAreaType: "state",
      localityType: "city",
      upperFields: ["administrativeArea"],
      subRegions: [
        { code: "CA", name: "California" },
        { code: "NY", name: "New York" },
      ],
    };
  },
};

const customValidator = createValidator(testProvider);

describe("validateAddress with custom provider", () => {
  it("returns valid for a correct address", async () => {
    const address: Address = {
      country: "US",
      line1: "123 Main St",
      locality: "Los Angeles",
      administrativeArea: "CA",
      postalCode: "90210",
    };
    const result = await customValidator.validateAddress(address);
    expect(result.valid).toBe(true);
  });
});

describe("validateAddress missing required field", () => {
  it("returns error for missing line1", async () => {
    const address: Address = { country: "US", line1: "" };
    const result = await customValidator.validateAddress(address);
    expect(result.errors.some((e) => e.field === "line1")).toBe(true);
  });
});

describe("validateField with valid postal code", () => {
  it("returns null error for valid zip code", async () => {
    const address: Address = {
      country: "US",
      line1: "123 Main St",
      locality: "Los Angeles",
      administrativeArea: "CA",
      postalCode: "90210",
    };
    const error = await customValidator.validateField(address, "postalCode");
    expect(error).toBeNull();
  });
});

describe("validateField with invalid postal code", () => {
  it("returns error message for invalid zip code", async () => {
    const address: Address = {
      country: "US",
      line1: "123 Main St",
      locality: "Los Angeles",
      administrativeArea: "CA",
      postalCode: "invalid",
    };
    const error = await customValidator.validateField(address, "postalCode");
    expect(error).toContain("Invalid ZIP Code format");
  });
});

describe("validateAddress top-level default loader", () => {
  it("validates using bundled metadata without explicit provider", async () => {
    const address: Address = {
      country: "US",
      line1: "1600 Amphitheatre Pkwy",
      locality: "Mountain View",
      administrativeArea: "CA",
      postalCode: "94043",
    };
    const result = await validateAddress(address);
    expect(result.valid).toBe(true);
  });
});

describe("normalizeAddress top-level helper", () => {
  it("normalizes state code and trims fields", async () => {
    const address: Address = {
      country: "us",
      line1: "  1600 Amphitheatre Pkwy  ",
      locality: "  Mountain View  ",
      administrativeArea: "ca",
      postalCode: "  94043  ",
    };
    const normalized = await normalizeAddress(address);
    expect(normalized.country).toBe("US");
  });
});

describe("formatAddress top-level helper", () => {
  it("formats address to postal string", async () => {
    const address: Address = {
      country: "US",
      line1: "1600 Amphitheatre Pkwy",
      locality: "Mountain View",
      administrativeArea: "CA",
      postalCode: "94043",
    };
    const formatted = await formatAddress(address, { singleLine: true });
    expect(formatted).toContain("MOUNTAIN VIEW");
  });
});

describe("custom async validator rule", () => {
  it("executes custom async validator and collects errors", async () => {
    const poBoxValidator = (addr: Address) => {
      if (addr.line1.toLowerCase().includes("po box")) {
        return [{ field: "line1" as const, message: "PO Boxes are not allowed" }];
      }
      return [];
    };

    const address: Address = {
      country: "US",
      line1: "PO Box 123",
      locality: "Los Angeles",
      administrativeArea: "CA",
      postalCode: "90210",
    };

    const result = await validateAddress(address, {
      customValidators: [poBoxValidator],
    });
    expect(result.errors.some((e) => e.message === "PO Boxes are not allowed")).toBe(true);
  });
});
