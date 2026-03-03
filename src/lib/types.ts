export const COUNTRY_CODES = [
  "us", "ch", "jp", "kr", "hk", "de", "gb", "fr", "it", "es",
  "au", "ca", "mx", "th", "id", "br", "co", "cl", "pe", "ar",
  "sa", "ae",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export type CountryRevenues = {
  [K in `${CountryCode}_revenue`]: number;
};

export type Supergenre = "Core" | "Casual" | "Casino";

export interface Game extends CountryRevenues {
  app_name: string;
  publisher_name: string;
  publisher_country: string;
  subcategory: string;
  supergenre: Supergenre | null;
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
  publisher_stats?: PublisherStats;
}

// DTC uplift calculation result (low end and high end)
export interface DtcUplift {
  // Inputs
  us_net_revenue: number;
  non_us_net_revenue: number;
  total_net_revenue: number;
  supergenre: Supergenre;

  // Step 1: Gross up
  us_gross_revenue: number;
  non_us_gross_revenue: number;
  total_gross_revenue: number;

  // Step 2: DTC shift (low/high)
  direct_checkout_rate_low: number;
  direct_checkout_rate_high: number;
  webshop_rate_low: number;
  webshop_rate_high: number;

  direct_checkout_gross_low: number;
  direct_checkout_gross_high: number;
  webshop_gross_low: number;
  webshop_gross_high: number;

  total_dtc_gross_low: number;
  total_dtc_gross_high: number;

  // Step 3 + 4: Net revenue by channel
  app_store_remaining_gross_low: number;
  app_store_remaining_gross_high: number;
  app_store_net_low: number;
  app_store_net_high: number;
  dtc_net_low: number;
  dtc_net_high: number;
  total_net_with_dtc_low: number;
  total_net_with_dtc_high: number;

  // Step 5: Uplift (total and per-channel)
  direct_checkout_uplift_low: number;
  direct_checkout_uplift_high: number;
  webshop_uplift_low: number;
  webshop_uplift_high: number;
  uplift_low: number;
  uplift_high: number;
  uplift_pct_low: number;
  uplift_pct_high: number;
}

export interface PublisherSearchResult {
  publisher_name: string;
  game_count: number;
  total_revenue: number;
}

export interface PublisherStats {
  total_revenue: number;
  total_downloads: number;
  avg_rpd: number;
  us_share: number;
  country_shares: Record<string, number>;
  country_revenues: Record<string, number>;
  dtc_uplift: DtcUplift;
}
