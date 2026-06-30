import { describe, it, expect } from "vitest";
import { createDr5hnProvider } from "../provider";

describe("dr5hn provider", () => {
  it("returns countries with code and name", async () => {
    const provider = createDr5hnProvider();
    const countries = await provider.getCountries();
    expect(countries.length).toBeGreaterThan(200);
    expect(countries[0]).toHaveProperty("code");
    expect(countries[0]).toHaveProperty("name");
    const us = countries.find((c) => c.code === "US");
    expect(us?.name).toBe("United States");
  });

  it("returns states for a country with states", async () => {
    const provider = createDr5hnProvider();
    const states = await provider.getStates("US");
    expect(states.length).toBeGreaterThan(40);
    expect(states[0]).toHaveProperty("code");
    expect(states[0]).toHaveProperty("name");
    const ca = states.find((s) => s.code === "CA");
    expect(ca?.name).toBe("California");
  });

  it("returns empty array for a country without states", async () => {
    const provider = createDr5hnProvider();
    const states = await provider.getStates("XX");
    expect(states).toEqual([]);
  });

  it("returns empty cities", async () => {
    const provider = createDr5hnProvider();
    const cities = await provider.getCities("US", "CA");
    expect(cities).toEqual([]);
  });

  it("returns metadata for supported countries", async () => {
    const provider = createDr5hnProvider();
    const metadata = await provider.getMetadata("US");
    expect(metadata.code).toBe("US");
    expect(metadata.format).toBeTruthy();
    expect(metadata.requiredFields).toContain("line1");
  });

  it("returns fallback metadata for unsupported countries", async () => {
    const provider = createDr5hnProvider();
    const metadata = await provider.getMetadata("XX");
    expect(metadata.code).toBe("XX");
    expect(metadata.requiredFields).toContain("line1");
  });
});
