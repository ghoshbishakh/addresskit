import type { AddressSchema, CountryAddressConfig, Field, FieldId } from "./types";

const FIELD_ORDER: FieldId[] = ["line1", "line2", "locality", "administrativeArea", "postalCode"];

export function buildSchema(config: CountryAddressConfig): AddressSchema {
  const fields: Field[] = [];

  for (const id of FIELD_ORDER) {
    if (!config.format.includes(fieldToken(id))) {
      continue;
    }

    const field: Field = {
      id,
      type: fieldType(id),
      label: config.fieldLabels[id] ?? label(id, config),
      required: config.requiredFields.includes(id),
      placeholder: config.fieldPlaceholders[id] ?? placeholder(id),
    };

    if (id === "administrativeArea" && config.subRegions) {
      field.type = "select";
      field.options = config.subRegions.map((r) => ({
        value: r.code,
        label: r.name,
      }));
    }

    if (id === "postalCode" && config.postalCodePattern) {
      field.validation = {
        pattern: config.postalCodePattern,
        message: `Invalid ${config.fieldLabels.postalCode ?? "postal code"} format`,
      };
    }

    fields.push(field);
  }

  return {
    fields,
    country: config.code,
    format: config.format,
  };
}

function fieldToken(id: FieldId): string {
  switch (id) {
    case "line1":
    case "line2":
      return "%A";
    case "locality":
      return "%C";
    case "administrativeArea":
      return "%S";
    case "postalCode":
      return "%Z";
  }
}

function fieldType(id: FieldId): "text" | "select" | "combobox" {
  switch (id) {
    case "administrativeArea":
      return "select";
    case "postalCode":
      return "text";
    default:
      return "text";
  }
}

function placeholder(id: FieldId): string {
  switch (id) {
    case "line1":
      return "Street address";
    case "line2":
      return "Apartment, suite, etc.";
    case "locality":
      return "";
    case "administrativeArea":
      return "";
    case "postalCode":
      return "";
  }
}

function label(id: FieldId, config: CountryAddressConfig): string {
  switch (id) {
    case "line1":
      return "Address Line 1";
    case "line2":
      return "Address Line 2";
    case "locality":
      return config.localityType.charAt(0).toUpperCase() + config.localityType.slice(1);
    case "administrativeArea":
      return config.administrativeAreaType.charAt(0).toUpperCase() + config.administrativeAreaType.slice(1);
    case "postalCode":
      return config.fieldLabels.postalCode ?? "Postal Code";
  }
}
