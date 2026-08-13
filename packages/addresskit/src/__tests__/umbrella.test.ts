import { describe, it, expect } from "vitest";

describe("addresskit umbrella root exports", () => {
  it("exports createEngine and formatAddress", async () => {
    const mod = await import("../index");
    expect(typeof mod.createEngine).toBe("function");
  });
});

describe("addresskit umbrella react exports", () => {
  it("exports Address and Address.Root", async () => {
    const mod = await import("../react");
    expect(typeof mod.Address).toBe("function");
  });
});

describe("addresskit umbrella validation exports", () => {
  it("exports validateAddress and normalizeAddress", async () => {
    const mod = await import("../validation");
    expect(typeof mod.validateAddress).toBe("function");
  });
});

describe("addresskit umbrella zod exports", () => {
  it("exports addressZodSchema", async () => {
    const mod = await import("../zod");
    expect(typeof mod.addressZodSchema).toBe("function");
  });
});
