import { describe, it, expect } from "vitest";
import { createLibaddressinputProvider } from "../provider";

const provider = createLibaddressinputProvider();

describe("createLibaddressinputProvider", () => {
  it("returns list of countries", async () => {
    const countries = await provider.getCountries();
    expect(countries.length).toBeGreaterThan(0);
    expect(countries.some((c) => c.code === "US")).toBe(true);
  });

  it("returns states for US", async () => {
    const states = await provider.getStates("US");
    expect(states.length).toBeGreaterThan(0);
    expect(states.some((s) => s.code === "CA")).toBe(true);
  });

  it("returns metadata for US", async () => {
    const meta = await provider.getMetadata("US");
    expect(meta.code).toBe("US");
    expect(meta.format).toBe("%A%n%C, %S %Z");
  });

  it("returns empty cities", async () => {
    const cities = await provider.getCities("US", "CA");
    expect(cities).toEqual([]);
  });
});
