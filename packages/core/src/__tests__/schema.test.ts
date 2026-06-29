import { describe, it, expect } from "vitest";
import { buildSchema } from "../schema";
import type { CountryAddressConfig } from "../types";

const usConfig: CountryAddressConfig = {
  code: "US",
  format: "%A%n%C, %S %Z",
  requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
  fieldLabels: { postalCode: "ZIP Code" },
  fieldPlaceholders: { postalCode: "90210" },
  postalCodePattern: "\\d{5}([-]\\d{4})?",
  administrativeAreaType: "state",
  localityType: "city",
  upperFields: ["locality", "administrativeArea"],
  subRegions: [{ code: "CA", name: "California" }],
};

const deConfig: CountryAddressConfig = {
  code: "DE",
  format: "%A%n%Z %C",
  requiredFields: ["line1", "locality", "postalCode"],
  fieldLabels: { postalCode: "PLZ", locality: "Ort" },
  fieldPlaceholders: { postalCode: "10115" },
  postalCodePattern: "\\d{5}",
  administrativeAreaType: "state",
  localityType: "city",
};

describe("buildSchema", () => {
  it("builds schema for US with 5 fields", () => {
    const schema = buildSchema(usConfig);
    expect(schema.country).toBe("US");
    expect(schema.fields).toHaveLength(5);
  });

  it("marks required fields as required", () => {
    const schema = buildSchema(usConfig);
    const line1 = schema.fields.find((f) => f.id === "line1");
    expect(line1?.required).toBe(true);
  });

  it("includes line2 as optional field", () => {
    const schema = buildSchema(usConfig);
    const line2 = schema.fields.find((f) => f.id === "line2");
    expect(line2).toBeDefined();
    expect(line2?.required).toBe(false);
  });

  it("assigns select type for administrativeArea with subRegions", () => {
    const schema = buildSchema(usConfig);
    const state = schema.fields.find((f) => f.id === "administrativeArea");
    expect(state?.type).toBe("select");
    expect(state?.options).toHaveLength(1);
  });

  it("assigns text type for administrativeArea without subRegions", () => {
    const schema = buildSchema(deConfig);
    const state = schema.fields.find((f) => f.id === "administrativeArea");
    expect(state).toBeUndefined();
  });

  it("includes postal code validation pattern", () => {
    const schema = buildSchema(usConfig);
    const zip = schema.fields.find((f) => f.id === "postalCode");
    expect(zip?.validation?.pattern).toBe("\\d{5}([-]\\d{4})?");
  });

  it("uses custom labels from config", () => {
    const schema = buildSchema(usConfig);
    const zip = schema.fields.find((f) => f.id === "postalCode");
    expect(zip?.label).toBe("ZIP Code");
  });

  it("uses label derived from administrativeAreaType", () => {
    const schema = buildSchema(usConfig);
    const state = schema.fields.find((f) => f.id === "administrativeArea");
    expect(state?.label).toBe("State");
  });
});
