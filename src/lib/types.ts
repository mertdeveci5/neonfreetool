export const COUNTRY_CODES = [
  "us", "ch", "jp", "kr", "hk", "de", "gb", "fr", "it", "es",
  "au", "ca", "mx", "th", "id", "br", "co", "cl", "pe", "ar",
  "sa", "ae",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export type CountryRevenues = {
  [K in `${CountryCode}_revenue`]: number;
};

export interface Game extends CountryRevenues {
  app_name: string;
  publisher_name: string;
  publisher_country: string;
  subcategory: string;
  domain: string | null;
  total_revenue: number;
  total_downloads: number;
}

export type FlowStep = "email" | "confirm" | "results" | "no-match";

export interface LookupRequest {
  email: string;
}

export interface LookupResponse {
  matched: boolean;
  publisher_name?: string;
  games?: Game[];
  benchmarks?: IndustryBenchmarks;
  publisher_stats?: PublisherStats;
}

export interface IndustryBenchmarks {
  median_us_share: number;
  top_quartile_us_share: number;
  median_rpd: number;
  top_quartile_rpd: number;
  top_quartile_country_shares: Record<string, number>;
}

export interface PublisherStats {
  total_revenue: number;
  total_downloads: number;
  avg_rpd: number;
  us_share: number;
  country_shares: Record<string, number>;
  country_revenues: Record<string, number>;
  uplift_by_country: Record<string, number>;
  total_uplift: number;
  rpd_uplift: number;
}
