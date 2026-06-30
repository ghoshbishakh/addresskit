import { describe, it, expect } from "vitest";
import { loadMetadata, getSupportedCountries } from "../loader";
import { getCountries, getCountryName, getStateName } from "../index";

describe("loadMetadata", () => {
  it("loads US metadata", async () => {
    const meta = await loadMetadata("US");
    expect(meta.code).toBe("US");
    expect(meta.format).toBe("%A%n%C %S %Z");
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
    expect(meta.postalCodePattern).toBe("^\\d{5}$");
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

describe("getCountries", () => {
  it("returns code/name pairs without loading per-country metadata", () => {
    const countries = getCountries();
    expect(countries.length).toBeGreaterThan(200);
    const us = countries.find((c) => c.code === "US");
    expect(us?.name).toBeTruthy();
  });

  it("excludes language variants like CA--FR", () => {
    const countries = getCountries();
    expect(countries.some((c) => c.code.includes("--"))).toBe(false);
  });
});

describe("getCountryName", () => {
  it("resolves a known country code", () => {
    expect(getCountryName("US")).toBeTruthy();
  });

  it("returns undefined for an unknown code", () => {
    expect(getCountryName("ZZ")).toBeUndefined();
  });
});

describe("getStateName", () => {
  it("resolves a subregion code to its display name", async () => {
    expect(await getStateName("US", "CA")).toBe("California");
  });

  it("returns undefined for an unknown subregion code", async () => {
    expect(await getStateName("US", "ZZ")).toBeUndefined();
  });
});
