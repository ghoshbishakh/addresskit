import type { Address, CountryAddressConfig, FieldId } from "./types";

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

/**
 * Resolve an `administrativeArea` code (e.g. "CA") to its display name
 * (e.g. "California") when the country defines subregions. Falls back to the
 * raw value for free-text regions or unrecognized codes.
 */
export function resolveAdministrativeArea(
  config: CountryAddressConfig,
  value: string | undefined,
): string {
  if (!value) return "";
  const match = config.subRegions?.find((r) => r.code === value);
  return match?.name ?? value;
}

/**
 * Render an address into a postal-formatted string using the country's format
 * template. The `administrativeArea` code is resolved to its full display name.
 * Pure and synchronous; the engine wraps this with on-demand metadata loading.
 */
export function formatAddress(config: CountryAddressConfig, address: Address): string {
  const upper = config.upperFields ?? [];

  const replacements: Record<string, string> = {
    "%N": "",
    "%O": "",
    "%A": [address.line1, address.line2].filter(Boolean).join(", "),
    "%D": "",
    "%C": address.locality ?? "",
    "%S": resolveAdministrativeArea(config, address.administrativeArea),
    "%Z": address.postalCode ?? "",
    "%X": "",
  };

  let result = config.format;
  for (const [token, value] of Object.entries(replacements)) {
    const field = TOKEN_TO_FIELD[token];
    const finalVal = field && upper.includes(field) ? value.toUpperCase() : value;
    // Replace every occurrence of the token (split/join avoids regex escaping).
    result = result.split(token).join(finalVal);
  }

  return result
    .replace(/%n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/,\s*,/g, ",")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();
}
