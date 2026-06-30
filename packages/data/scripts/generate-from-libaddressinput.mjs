import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../src/data");
mkdirSync(outDir, { recursive: true });

const raw = readFileSync("/tmp/countryinfo.txt", "utf-8");
const lines = raw.trim().split("\n");

// Map Google's field letters to our FieldId for requiredFields mapping
const fieldMap = {
  N: null,
  O: null,
  A: "line1",
  C: "locality",
  S: "administrativeArea",
  Z: "postalCode",
};

const localityTypes = {
  city: "city",
  district: "district",
  post_town: "post town",
  suburb: "suburb",
  townland: "townland",
  village_township: "village/township",
};

const adminTypes = {
  state: "state",
  province: "province",
  parish: "parish",
  prefecture: "prefecture",
  do_si: "do/si",
  emirate: "emirate",
  island: "island",
  oblast: "oblast",
  county: "county",
  department: "department",
  region: "region",
  territory: "territory",
};

// Parse all country entries
const loaderLines = [];
const countryIndex = [];
let countryCount = 0;

for (const line of lines) {
  if (!line.startsWith("data/") || line.includes("data/ZZ")) continue;

  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) continue;

  const path = line.slice(5, eqIdx);
  const dataStr = line.slice(eqIdx + 1);

  // Only process top-level country entries, not sub-regions
  if (path.includes("/")) continue;

  const code = path;

  let data;
  try {
    data = JSON.parse(dataStr);
  } catch {
    continue;
  }

  const codeUpper = code.toUpperCase();

  // Clean format: strip %N (name) and %O (org) placeholders
  const fmt = data.fmt || "%A%n%C";
  let format = fmt;

  // Remove %N and %O along with surrounding %n
  format = format.replace(/%N%n/g, "");
  format = format.replace(/%O%n/g, "");
  format = format.replace(/%n%N/g, "");
  format = format.replace(/%n%O/g, "");
  format = format.replace(/%N/g, "");
  format = format.replace(/%O/g, "");

  // Strip leading/trailing %n
  format = format.replace(/^(%n)+/, "");
  format = format.replace(/(%n)+$/, "");

  // Remove consecutive %n
  format = format.replace(/(%n)+/g, "%n");

  // Map required fields
  const requireStr = data.require || "";
  const requiredFields = [];
  for (const ch of requireStr) {
    const ourField = fieldMap[ch];
    if (ourField && !requiredFields.includes(ourField)) {
      requiredFields.push(ourField);
    }
  }
  // line1 is always required
  if (!requiredFields.includes("line1")) {
    requiredFields.unshift("line1");
  }

  // Postal code pattern
  const zipPattern = data.zip ? `^${data.zip}$` : undefined;

  // Upper fields
  const upperStr = data.upper || "";
  const upperFields = [];
  for (const ch of upperStr) {
    const ourField = fieldMap[ch];
    if (ourField) upperFields.push(ourField);
  }

  // Administrative area type
  const adminType = data.state_name_type || "state";

  // Locality type
  const localityType = data.locality_name_type || "city";

  // Sub-regions (states)
  const subRegions = [];
  if (data.sub_keys) {
    const keys = data.sub_keys.split("~");
    const names = data.sub_names ? data.sub_names.split("~") : keys;
    const codes = data.sub_isoids ? data.sub_isoids.split("~") : [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const subName = names[i] || key;
      const subCode = codes[i] || key;
      subRegions.push({ code: subCode, name: subName });
    }
  }

  // Determine which fields are in the format
  const fieldsInFormat = [];
  if (format.includes("%A")) fieldsInFormat.push("line1");
  if (format.includes("%C")) fieldsInFormat.push("locality");
  if (format.includes("%S")) fieldsInFormat.push("administrativeArea");
  if (format.includes("%Z")) fieldsInFormat.push("postalCode");

  // Postal code label override
  const zipNameType = data.zip_name_type || "postal";
  const postalLabel = zipNameType === "zip" ? "ZIP Code" : "Postal code";
  const postalPlaceholder = zipNameType === "zip" ? "90210" : "SW1A 1AA";

  const fieldLabels = {};
  const fieldPlaceholders = {};

  for (const f of fieldsInFormat) {
    if (f === "administrativeArea") {
      const name = adminTypes[adminType] || adminType;
      fieldLabels[f] = name.charAt(0).toUpperCase() + name.slice(1);
      fieldPlaceholders[f] = fieldLabels[f];
    } else if (f === "locality") {
      const lt = localityTypes[localityType] || "City";
      fieldLabels[f] = lt.charAt(0).toUpperCase() + lt.slice(1);
      fieldPlaceholders[f] = fieldLabels[f];
    } else if (f === "postalCode") {
      fieldLabels[f] = postalLabel;
      fieldPlaceholders[f] = postalPlaceholder;
    } else {
      fieldLabels[f] = "Street address";
      fieldPlaceholders[f] = "Street address";
    }
  }

  const countryName = (data.name || code).trim().replace(/\b\w/g, (c) => c.toUpperCase());

  const config = {
    code: codeUpper,
    name: countryName,
    format,
    requiredFields,
    fieldLabels,
    fieldPlaceholders,
    postalCodePattern: zipPattern,
    administrativeAreaType: adminType,
    localityType,
    upperFields: upperFields.length > 0 ? upperFields : undefined,
  };

  if (subRegions.length > 0) {
    config.subRegions = subRegions;
  }

  const fileName = `${codeUpper}.json`;
  writeFileSync(resolve(outDir, fileName), JSON.stringify(config, null, 2) + "\n", "utf-8");
  loaderLines.push(`  ${JSON.stringify(codeUpper)}: () => import("./data/${fileName}"),`);
  // Language/script variants (e.g. CA--FR) are metadata refinements, not
  // separate countries, so they are excluded from the country index.
  if (!codeUpper.includes("--")) {
    countryIndex.push({ code: codeUpper, name: countryName });
  }
  countryCount++;
}

// Generate loader.ts
const loaderCode = `// Auto-generated from Google libaddressinput data. Do not edit.

import type { CountryAddressConfig } from "@addresskit/core";

const loaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
${loaderLines.join("\n")}};

export async function loadMetadata(code: string): Promise<CountryAddressConfig> {
  const loader = loaders[code];
  if (!loader) {
    throw new Error(\`No metadata found for country: \${code}\`);
  }
  const mod = await loader();
  return mod.default as unknown as CountryAddressConfig;
}

export function getSupportedCountries(): string[] {
  return Object.keys(loaders);
}
`;

writeFileSync(resolve(__dirname, "../src/loader.ts"), loaderCode, "utf-8");

// Generate countries.ts: a lightweight index for building country selectors
// without loading every per-country metadata file.
countryIndex.sort((a, b) => a.name.localeCompare(b.name));
const countriesCode = `// Auto-generated from country metadata. Do not edit.

/** Lightweight country index (code + display name), sorted by name. */
export const COUNTRIES: readonly { code: string; name: string }[] = [
${countryIndex.map((c) => `  { code: ${JSON.stringify(c.code)}, name: ${JSON.stringify(c.name)} },`).join("\n")}
];
`;

writeFileSync(resolve(__dirname, "../src/countries.ts"), countriesCode, "utf-8");

console.log(
  `Generated ${countryCount} country metadata files, loader.ts, and ${countryIndex.length} entries in countries.ts`,
);
