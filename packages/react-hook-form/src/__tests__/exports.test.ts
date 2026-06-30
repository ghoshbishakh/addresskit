import { describe, it, expect } from "vitest";

describe("package exports", () => {
  it("exports AddressController", async () => {
    const mod = await import("../index");
    expect(mod.AddressController).toBeDefined();
  });
});
