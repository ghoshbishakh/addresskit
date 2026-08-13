import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Address } from "../components/address";
import { AddressProviderContext } from "../context";
import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";

const usConfig: CountryAddressConfig = {
  code: "US",
  name: "United States",
  format: "%A%n%C, %S %Z",
  requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
  fieldLabels: {
    line1: "Street address",
    locality: "City",
    administrativeArea: "State",
    postalCode: "ZIP Code",
  },
  fieldPlaceholders: {},
  postalCodePattern: "^\\d{5}$",
  administrativeAreaType: "state",
  localityType: "city",
  subRegions: [{ code: "CA", name: "California" }],
};

const mockProvider: AddressProvider = {
  async getCountries() {
    return [{ code: "US", name: "United States" }];
  },
  async getStates() {
    return usConfig.subRegions ?? [];
  },
  async getCities() {
    return [];
  },
  async getMetadata() {
    return usConfig;
  },
};

describe("Address.Root and Address.Country compound primitives", () => {
  it("renders country selector through compound component", async () => {
    render(
      <AddressProviderContext.Provider value={mockProvider}>
        <Address.Root value={{ country: "US" }} onChange={() => {}}>
          <Address.Country />
        </Address.Root>
      </AddressProviderContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Country")).toBeDefined();
    });
  });
});

describe("Address.Fields and Address.Input compound primitives", () => {
  it("renders custom fields using slot pattern", async () => {
    render(
      <AddressProviderContext.Provider value={mockProvider}>
        <Address.Root value={{ country: "US" }} onChange={() => {}}>
          <Address.Country />
          <Address.Fields>
            {(field) => (
              <Address.Field key={field.id} field={field}>
                <Address.Label />
                <Address.Input className="my-custom-input" />
              </Address.Field>
            )}
          </Address.Fields>
        </Address.Root>
      </AddressProviderContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Street address/i)).toBeDefined();
    });
  });
});
