import type { CountryAddressConfig } from "@addresskit/core";

const loaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  US: () => import("./data/us.json"),
  GB: () => import("./data/gb.json"),
  CA: () => import("./data/ca.json"),
  DE: () => import("./data/de.json"),
  JP: () => import("./data/jp.json"),
  AU: () => import("./data/au.json"),
  BR: () => import("./data/br.json"),
};

export async function loadMetadata(code: string): Promise<CountryAddressConfig> {
  const loader = loaders[code];
  if (!loader) {
    throw new Error(`No metadata found for country: ${code}`);
  }
  const mod = await loader();
  return mod.default as unknown as CountryAddressConfig;
}

export function getSupportedCountries(): string[] {
  return Object.keys(loaders);
}
