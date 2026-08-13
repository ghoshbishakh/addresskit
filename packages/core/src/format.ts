import type {
  Address,
  CountryAddressConfig,
  FieldId,
  FormatOptions,
} from "./types";

const TOKEN_TO_FIELD: Record<string, FieldId | null> = {
  "%N": null,
  "%O": null,
  "%A": "line1",
  "%D": null,
  "%C": "locality",
  "%S": "administrativeArea",
  "%Z": "postalCode",
  "%X": null,
};

function resolveAdministrativeArea(
  config: CountryAddressConfig,
  value: string | undefined,
): string {
  if (!value) return "";
  const match = config.subRegions?.find(
    (r) =>
      r.code.toLowerCase() === value.toLowerCase() ||
      r.name.toLowerCase() === value.toLowerCase(),
  );
  return match?.name ?? value;
}

function formatAddress(
  config: CountryAddressConfig,
  address: Address,
  options?: FormatOptions,
): string {
  const upper = config.upperFields ?? [];

  const street = [address.line1, address.line2].filter(Boolean).join(", ");
  const replacements: Record<string, string> = {
    "%N": "",
    "%O": "",
    "%A": street,
    "%D": "",
    "%C": address.locality ?? "",
    "%S": resolveAdministrativeArea(config, address.administrativeArea),
    "%Z": address.postalCode ?? "",
    "%X": "",
  };

  let result = config.format;
  for (const [token, value] of Object.entries(replacements)) {
    const field = TOKEN_TO_FIELD[token];
    const finalVal =
      field && upper.includes(field) ? value.toUpperCase() : value;
    result = result.split(token).join(finalVal);
  }

  let formatted = result
    .replace(/%n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/,\s*,/g, ",")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();

  if (options?.singleLine) {
    formatted = formatted
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(", ");
  }

  if (options?.includeCountry) {
    const countryLabel =
      options.countryName ?? config.name ?? config.code ?? address.country;
    if (countryLabel) {
      if (options?.singleLine) {
        formatted = `${formatted}, ${countryLabel}`;
      } else {
        formatted = `${formatted}\n${countryLabel}`;
      }
    }
  }

  return formatted.replace(/,\s*,/g, ",").trim();
}

export { formatAddress, resolveAdministrativeArea };
