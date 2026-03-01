import XLSX from "xlsx";
import { writeFileSync } from "fs";
import { resolve } from "path";

const COUNTRY_REVENUE_KEYS = [
  "us_revenue",
  "ch_revenue",
  "jp_revenue",
  "kr_revenue",
  "hk_revenue",
  "de_revenue",
  "gb_revenue",
  "fr_revenue",
  "it_revenue",
  "es_revenue",
  "au_revenue",
  "ca_revenue",
  "mx_revenue",
  "th_revenue",
  "id_revenue",
  "br_revenue",
  "co_revenue",
  "cl_revenue",
  "pe_revenue",
  "ar_revenue",
  "sa_revenue",
  "ae_revenue",
] as const;

function normalizeDomain(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

function main() {
  const xlsxPath = resolve(__dirname, "../data/game_list.xlsx");
  const outPath = resolve(__dirname, "../src/data/games.json");

  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  const games = raw.map((row) => {
    const countryRevenues: Record<string, number> = {};
    for (const key of COUNTRY_REVENUE_KEYS) {
      const cleanKey = key.replace(/^\uFEFF/, "");
      const val = row[cleanKey] ?? row[key] ?? 0;
      countryRevenues[key] = typeof val === "number" ? val : Number(val) || 0;
    }

    const website = row["company_website"];
    const domain =
      website && typeof website === "string" ? normalizeDomain(website) : null;

    return {
      app_name: String(row["app_name"] ?? ""),
      publisher_name: String(row["publisher_name"] ?? ""),
      publisher_country: String(row["publisher_country"] ?? ""),
      subcategory: String(row["subcategory"] ?? ""),
      domain,
      ...countryRevenues,
      total_revenue:
        typeof row["total_revenue"] === "number"
          ? row["total_revenue"]
          : Number(row["total_revenue"]) || 0,
      total_downloads:
        typeof row["total_downloads"] === "number"
          ? row["total_downloads"]
          : Number(row["total_downloads"]) || 0,
    };
  });

  writeFileSync(outPath, JSON.stringify(games, null, 0));
  console.log(`Wrote ${games.length} games to ${outPath}`);

  const withDomain = games.filter((g) => g.domain);
  const uniqueDomains = new Set(withDomain.map((g) => g.domain));
  console.log(`  ${withDomain.length} games with domain`);
  console.log(`  ${uniqueDomains.size} unique domains`);
}

main();
