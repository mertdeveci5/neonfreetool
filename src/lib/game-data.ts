import gamesRaw from "@/data/games.json";
import { Game } from "./types";

const games = gamesRaw as Game[];

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
