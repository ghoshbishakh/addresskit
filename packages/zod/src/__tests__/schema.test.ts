import { describe, it, expect } from "vitest";
import { z } from "zod";
import { addressZodSchema } from "../schema";

const schema = z.object({
  shipping: addressZodSchema(),
});

describe("addressZodSchema with valid address", () => {
  it("parses valid US address successfully", async () => {
    const validData = {
      shipping: {
        country: "US",
        line1: "1600 Amphitheatre Pkwy",
        locality: "Mountain View",
        administrativeArea: "CA",
        postalCode: "94043",
      },
    };

    const parsed = await schema.parseAsync(validData);
    expect(parsed.shipping.locality).toBe("Mountain View");
  });
});

describe("addressZodSchema missing required field", () => {
  it("rejects when required line1 is empty", async () => {
    const invalidData = {
      shipping: {
        country: "US",
        line1: "",
        locality: "Mountain View",
        administrativeArea: "CA",
        postalCode: "94043",
      },
    };

    await expect(schema.parseAsync(invalidData)).rejects.toThrow();
  });
});

describe("addressZodSchema invalid postal code", () => {
  it("rejects invalid postal code format", async () => {
    const invalidData = {
      shipping: {
        country: "US",
        line1: "1600 Amphitheatre Pkwy",
        locality: "Mountain View",
        administrativeArea: "CA",
        postalCode: "bad-zip",
      },
    };

    await expect(schema.parseAsync(invalidData)).rejects.toThrow();
  });
});
