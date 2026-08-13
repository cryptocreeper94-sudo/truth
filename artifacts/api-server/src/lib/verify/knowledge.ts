import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { logger } from "../logger";

/**
 * Lightweight retrieval over the local knowledge-pack corpus
 * (knowledge_packs/*.md). Packs are split into sections; sections are scored
 * by keyword overlap with the claim text. No external services involved.
 */

interface PackSection {
  pack: string;
  heading: string;
  text: string;
  tokens: Set<string>;
}

const STOPWORDS = new Set(
  `a an and are as at be but by for from has have how in is it its of on or
   that the this to was were what when where which who will with not no can
   than then they them their there these those you your our we us i he she
   his her also into about more most some such only over under between been
   would could should may might must do does did done being very just like`
    .split(/\s+/)
    .filter(Boolean),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

let sectionsCache: PackSection[] | null = null;

function resolvePacksDir(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "knowledge_packs"),
    path.resolve(process.cwd(), "../../knowledge_packs"),
    path.resolve(process.cwd(), "../knowledge_packs"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

async function loadSections(): Promise<PackSection[]> {
  if (sectionsCache) return sectionsCache;

  const dir = resolvePacksDir();
  if (!dir) {
    logger.warn("knowledge_packs directory not found; corpus search disabled");
    sectionsCache = [];
    return sectionsCache;
  }

  const sections: PackSection[] = [];
  try {
    const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = await readFile(path.join(dir, file), "utf-8");
      const packName = file
        .replace(/^\d+_/, "")
        .replace(/_knowledge_pack\.md$/, "")
        .replace(/_/g, " ");
      // Split on markdown headings; keep heading with its body.
      const parts = raw.split(/\n(?=#{1,3} )/);
      for (const part of parts) {
        const lines = part.split("\n");
        const heading = (lines[0] ?? "").replace(/^#+\s*/, "").trim();
        const text = part.trim();
        if (text.length < 100) continue;
        sections.push({
          pack: packName,
          heading,
          text: text.slice(0, 4000),
          tokens: new Set(tokenize(text)),
        });
      }
    }
  } catch (err) {
    logger.error({ err }, "Failed to load knowledge packs");
  }

  sectionsCache = sections;
  logger.info(
    { sections: sections.length },
    "Knowledge pack corpus loaded for verification",
  );
  return sections;
}

export interface CorpusSnippet {
  pack: string;
  heading: string;
  excerpt: string;
}

/**
 * Return up to `limit` corpus snippets relevant to the claim, ranked by
 * keyword overlap. Returns an empty array when nothing meaningfully matches.
 */
export async function searchCorpus(
  claim: string,
  limit = 2,
): Promise<CorpusSnippet[]> {
  const sections = await loadSections();
  if (sections.length === 0) return [];

  const claimTokens = tokenize(claim);
  if (claimTokens.length === 0) return [];

  const scored = sections
    .map((s) => {
      let score = 0;
      for (const t of claimTokens) if (s.tokens.has(t)) score++;
      return { s, score };
    })
    .filter((x) => x.score >= Math.min(3, claimTokens.length))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ s }) => ({
    pack: s.pack,
    heading: s.heading,
    excerpt: s.text.slice(0, 1200),
  }));
}
