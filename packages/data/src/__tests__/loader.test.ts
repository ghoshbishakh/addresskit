import { describe, it, expect } from "vitest";
import { loadMetadata, getSupportedCountries } from "../loader";

describe("loadMetadata", () => {
  it("loads US metadata", async () => {
    const meta = await loadMetadata("US");
    expect(meta.code).toBe("US");
    expect(meta.format).toBe("%A%n%C, %S %Z");
    expect(meta.requiredFields).toContain("line1");
    expect(meta.subRegions).toBeDefined();
  });

  it("loads GB metadata", async () => {
    const meta = await loadMetadata("GB");
    expect(meta.code).toBe("GB");
    expect(meta.requiredFields).not.toContain("administrativeArea");
  });

  it("loads DE metadata", async () => {
    const meta = await loadMetadata("DE");
    expect(meta.code).toBe("DE");
    expect(meta.postalCodePattern).toBe("\\d{5}");
  });

  it("loads JP metadata", async () => {
    const meta = await loadMetadata("JP");
    expect(meta.code).toBe("JP");
    expect(meta.administrativeAreaType).toBe("prefecture");
  });

  it("throws for unknown country", async () => {
    await expect(loadMetadata("XX")).rejects.toThrow();
  });
});

describe("getSupportedCountries", () => {
  it("returns list of country codes", () => {
    const codes = getSupportedCountries();
    expect(codes).toContain("US");
    expect(codes).toContain("GB");
    expect(codes).toContain("CA");
  });
});
