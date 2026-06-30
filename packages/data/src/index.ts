import { loadMetadata } from "./loader";
import { COUNTRIES } from "./countries";

export { loadMetadata, getSupportedCountries } from "./loader";
export { COUNTRIES } from "./countries";

/**
 * Country list (code + display name) for building selectors. Backed by a small
 * bundled index, so it does not load any per-country metadata file.
 */
export function getCountries(): { code: string; name: string }[] {
  return COUNTRIES.map((c) => ({ ...c }));
}

/** Resolve a country code to its display name, or `undefined` if unknown. */
export function getCountryName(code: string): string | undefined {
  return COUNTRIES.find((c) => c.code === code)?.name;
}

/**
 * Resolve a subregion (state/province) code to its display name for a country.
 * Loads that country's metadata on demand; returns `undefined` if the country
 * has no subregions or the code is unrecognized.
 */
export async function getStateName(country: string, code: string): Promise<string | undefined> {
  const metadata = await loadMetadata(country);
  return metadata.subRegions?.find((r) => r.code === code)?.name;
}
