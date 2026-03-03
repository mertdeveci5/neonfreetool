import Fuse from "fuse.js";
import gamesRaw from "@/data/games.json";
import { Game, PublisherSearchResult } from "./types";

const games = gamesRaw as Game[];

// --- Domain index (existing) ---

let domainIndex: Map<string, Game[]> | null = null;

function buildDomainIndex(): Map<string, Game[]> {
  const map = new Map<string, Game[]>();
  for (const game of games) {
    if (!game.domain) continue;
    const domain = game.domain.toLowerCase();
    const existing = map.get(domain);
    if (existing) {
      existing.push(game);
    } else {
      map.set(domain, [game]);
    }
  }
  return map;
}

export function getDomainIndex(): Map<string, Game[]> {
  if (!domainIndex) {
    domainIndex = buildDomainIndex();
  }
  return domainIndex;
}

export function lookupByDomain(domain: string): Game[] | undefined {
  return getDomainIndex().get(domain.toLowerCase());
}

export function getAllGames(): Game[] {
  return games;
}

// --- Publisher index + fuzzy search ---

let publisherIndex: Map<string, Game[]> | null = null;

function buildPublisherIndex(): Map<string, Game[]> {
  const map = new Map<string, Game[]>();
  for (const game of games) {
    const name = game.publisher_name;
    if (!name) continue;
    const existing = map.get(name);
    if (existing) {
      existing.push(game);
    } else {
      map.set(name, [game]);
    }
  }
  return map;
}

function getPublisherIndex(): Map<string, Game[]> {
  if (!publisherIndex) {
    publisherIndex = buildPublisherIndex();
  }
  return publisherIndex;
}

let fuseInstance: Fuse<{ name: string }> | null = null;

function getFuse(): Fuse<{ name: string }> {
  if (!fuseInstance) {
    const index = getPublisherIndex();
    const items = Array.from(index.keys()).map((name) => ({ name }));
    fuseInstance = new Fuse(items, {
      keys: ["name"],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }
  return fuseInstance;
}

export function searchPublishers(
  query: string,
  limit = 8
): PublisherSearchResult[] {
  const fuse = getFuse();
  const results = fuse.search(query, { limit });
  const index = getPublisherIndex();

  return results.map((r) => {
    const games = index.get(r.item.name) ?? [];
    return {
      publisher_name: r.item.name,
      game_count: games.length,
      total_revenue: games.reduce((sum, g) => sum + g.total_revenue, 0),
    };
  });
}

export function lookupByPublisher(name: string): Game[] | undefined {
  return getPublisherIndex().get(name);
}
