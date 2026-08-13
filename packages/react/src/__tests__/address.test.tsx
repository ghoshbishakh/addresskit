import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Address } from "../components/address";
import { AddressProviderContext } from "../context";
import type { AddressProvider, CountryAddressConfig } from "@addresskit/core";

const usConfig: CountryAddressConfig = {
  code: "US",
  name: "United States",
  format: "%A%n%C, %S %Z",
  requiredFields: ["line1", "locality", "administrativeArea", "postalCode"],
  fieldLabels: {
    line1: "Street Address",
    locality: "City",
    administrativeArea: "State",
    postalCode: "ZIP Code",
  },
  fieldPlaceholders: {
    line1: "123 Main St",
  },
  postalCodePattern: "^\\d{5}$",
  administrativeAreaType: "state",
  localityType: "city",
  upperFields: ["administrativeArea"],
  subRegions: [
    { code: "CA", name: "California" },
    { code: "NY", name: "New York" },
  ],
};

const gbConfig: CountryAddressConfig = {
  code: "GB",
  name: "United Kingdom",
  format: "%A%n%C%n%Z",
  requiredFields: ["line1", "locality", "postalCode"],
  fieldLabels: {
    line1: "Address line 1",
    locality: "Town/City",
    postalCode: "Postcode",
  },
  fieldPlaceholders: {},
  administrativeAreaType: "county",
  localityType: "city",
};

const mockProvider: AddressProvider = {
  async getCountries() {
    return [
      { code: "US", name: "United States" },
      { code: "GB", name: "United Kingdom" },
    ];
  },
  async getStates(country: string) {
    if (country === "US") return usConfig.subRegions ?? [];
    return [];
  },
  async getCities() {
    return [];
  },
  async getMetadata(country: string) {
    if (country === "US") return usConfig;
    if (country === "GB") return gbConfig;
    throw new Error(`Unknown country: ${country}`);
  },
};

describe("Address component country selection", () => {
  it("renders country options from provider", async () => {
    render(
      <AddressProviderContext.Provider value={mockProvider}>
        <Address value={{}} onChange={() => {}} />
      </AddressProviderContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText("United States")).toBeDefined();
    });
  });
});

describe("Address component fields rendering", () => {
  it("renders address fields when country is selected", async () => {
    render(
      <AddressProviderContext.Provider value={mockProvider}>
        <Address value={{ country: "US" }} onChange={() => {}} />
      </AddressProviderContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Street Address/i)).toBeDefined();
    });
  });
});

describe("Address component country cascade", () => {
  it("calls onChange when country dropdown changes", async () => {
    const handleChange = vi.fn();
    render(
      <AddressProviderContext.Provider value={mockProvider}>
        <Address
          value={{ country: "US", line1: "123 Main St", locality: "San Jose" }}
          onChange={handleChange}
        />
      </AddressProviderContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText("United Kingdom")).toBeDefined();
    });

    const countrySelect = screen.getByLabelText("Country");
    fireEvent.change(countrySelect, { target: { value: "GB" } });

    expect(handleChange).toHaveBeenCalledWith({ country: "GB", line1: "123 Main St" });
  });
});

describe("Address component disabled prop", () => {
  it("disables country select when disabled prop is true", async () => {
    render(
      <AddressProviderContext.Provider value={mockProvider}>
        <Address value={{ country: "US" }} onChange={() => {}} disabled={true} />
      </AddressProviderContext.Provider>,
    );

    const countrySelect = screen.getByLabelText("Country") as HTMLSelectElement;
    expect(countrySelect.disabled).toBe(true);
  });
});

describe("Address component styling classes", () => {
  it("applies custom root className", () => {
    const { container } = render(
      <AddressProviderContext.Provider value={mockProvider}>
        <Address
          value={{ country: "US" }}
          onChange={() => {}}
          className="custom-address-form"
        />
      </AddressProviderContext.Provider>,
    );

    expect(container.querySelector(".custom-address-form")).not.toBeNull();
  });
});
