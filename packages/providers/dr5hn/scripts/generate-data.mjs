import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../src/data");
mkdirSync(resolve(outDir, "states"), { recursive: true });

// Process countries
const countries = JSON.parse(readFileSync("/tmp/dr5hn_countries.json", "utf-8"));
const countryCodeToName = {};
const countryList = [];

for (const c of countries) {
  const code = c.iso2;
  if (!code) continue;
  countryCodeToName[code] = c.name;
  countryList.push({ code, name: c.name });
}

writeFileSync(resolve(outDir, "countries.json"), JSON.stringify(countryList), "utf-8");

// Process states - group by country_code
const states = JSON.parse(readFileSync("/tmp/dr5hn_states.json", "utf-8"));
const statesByCountry = {};

for (const s of states) {
  const cc = s.country_code;
  if (!cc) continue;
  if (!statesByCountry[cc]) statesByCountry[cc] = [];
  statesByCountry[cc].push({ code: s.iso2 || s.name, name: s.name });
}

const loaderLines = [];
for (const [code] of Object.entries(statesByCountry)) {
  loaderLines.push(`  ${JSON.stringify(code)}: () => import("./states/${code}.json"),`);
}

const loaderCode = `// Auto-generated. Do not edit.
const loaders: Record<string, () => Promise<{ default: { code: string; name: string }[] }>> = {
${loaderLines.join("\n")}};

export async function loadStates(country: string): Promise<{ code: string; name: string }[]> {
  const loader = loaders[country];
  if (!loader) return [];
  const mod = await loader();
  return mod.default as { code: string; name: string }[];
}

export async function loadCountries(): Promise<{ code: string; name: string }[]> {
  const mod = await import("./countries.json");
  return mod.default as { code: string; name: string }[];
}
`;

writeFileSync(resolve(__dirname, "../src/data/loader.ts"), loaderCode, "utf-8");

for (const [code, stateList] of Object.entries(statesByCountry)) {
  writeFileSync(resolve(outDir, `states/${code}.json`), JSON.stringify(stateList), "utf-8");
}

console.log(`Generated ${countryList.length} countries, ${Object.keys(statesByCountry).length} country state files, loader.ts`);
