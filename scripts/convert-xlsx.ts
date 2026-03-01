import XLSX from "xlsx";
import { readFileSync, writeFileSync } from "fs";
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

function loadSupergenreMap(): Map<string, string> {
  const cpPath = resolve(__dirname, "../data/classification_progress.json");
  const cp = JSON.parse(readFileSync(cpPath, "utf-8"));
  const map = new Map<string, string>();

  for (const entry of Object.values(cp.classified) as Array<{
    app_name: string;
    supergenre: string | null;
  }>) {
    if (entry.app_name && entry.supergenre) {
      map.set(entry.app_name, entry.supergenre);
    }
  }
  return map;
}

// Infer supergenre from subcategory when classification is missing
function inferSupergenre(subcategory: string): string | null {
  const lower = subcategory.toLowerCase();
  if (
    lower.includes("casino") ||
    lower.includes("poker") ||
    lower.includes("slots") ||
    lower.includes("bingo")
  ) {
    return "Casino";
  }
  if (
    lower.includes("puzzle") ||
    lower.includes("trivia") ||
    lower.includes("word") ||
    lower.includes("board") ||
    lower.includes("card") ||
    lower.includes("simulation") ||
    lower.includes("family") ||
    lower.includes("casual")
  ) {
    return "Casual";
  }
  if (
    lower.includes("action") ||
    lower.includes("adventure") ||
    lower.includes("role playing") ||
    lower.includes("strategy") ||
    lower.includes("racing") ||
    lower.includes("sports") ||
    lower.includes("shooter")
  ) {
    return "Core";
  }
  return null;
}

function main() {
  const xlsxPath = resolve(__dirname, "../data/game_list.xlsx");
  const outPath = resolve(__dirname, "../src/data/games.json");

  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  const supergenreMap = loadSupergenreMap();
  let classifiedCount = 0;
  let inferredCount = 0;
  let unclassifiedCount = 0;

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

    const appName = String(row["app_name"] ?? "");
    const subcategory = String(row["subcategory"] ?? "");

    // Supergenre: prefer classification data, fall back to subcategory inference
    let supergenre: string | null = supergenreMap.get(appName) || null;
    if (supergenre) {
      classifiedCount++;
    } else {
      supergenre = inferSupergenre(subcategory);
      if (supergenre) inferredCount++;
      else unclassifiedCount++;
    }

    return {
      app_name: appName,
      publisher_name: String(row["publisher_name"] ?? ""),
      publisher_country: String(row["publisher_country"] ?? ""),
      subcategory,
      supergenre,
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
  console.log(`  Supergenre: ${classifiedCount} from AppMagic, ${inferredCount} inferred, ${unclassifiedCount} unclassified`);

  // Distribution
  const dist: Record<string, number> = {};
  games.forEach((g) => {
    const sg = g.supergenre || "Unknown";
    dist[sg] = (dist[sg] || 0) + 1;
  });
  console.log(`  Distribution:`, dist);
}

main();
