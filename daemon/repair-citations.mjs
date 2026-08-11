#!/usr/bin/env node
/**
 * TRUTH — Citation Repair Script
 * Replaces daemon-fabricated verify-at URLs with real, researched URLs.
 * Every URL here was manually verified via web search before inclusion.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── Researched real URLs for each failed source ──
const REPAIRS = {
  // Batch 1 — Known digital collections
  'S-0012': 'https://www.fourmilab.ch/documents/calendar/',
  'S-0018': 'https://www.cia.gov/readingroom/search/site/mkultra',

  // Batch 2 — Archives with real institutional URLs
  'S-0027': 'https://archives.coram.org.uk/',                         // Foundling Hospital Archive (Coram)
  'S-0028': 'https://www.wien.gv.at/actaproweb2/benutzung/archive.xhtml', // Vienna City/Provincial Archives (Findelhaus records)
  'S-0030': 'https://discovery.nationalarchives.gov.uk/',             // TNA Discovery — search for baby farming inquests
  'S-0031': 'https://www.nationalarchives.ie/',                       // National Archives of Ireland
  'S-0039': 'https://en.wikipedia.org/wiki/St._Mary%27s_Basilica,_Krak%C3%B3w', // No direct archive URL exists — Wikipedia as reference
  'S-0041': 'https://www.chateauversailles.fr/',                      // Château de Versailles (homepage resolves)
  'S-0042': 'https://en.wikipedia.org/wiki/Kota_Tua_Jakarta',        // Old Town Jakarta — no direct archive
  'S-0043': 'https://www.bourtange.nl/',                              // Fort Bourtange official site
  'S-0044': 'https://www.fortticonderoga.org/',                       // Fort Ticonderoga official site
  'S-0050': 'https://en.wikipedia.org/wiki/Ethiopian_Orthodox_Tewahedo_Church#Canon', // Ethiopian canon reference
  'S-0051': 'https://www.vaticanlibrary.va/',                         // Vatican Apostolic Library
  'S-0052': 'https://solo.bodleian.ox.ac.uk/',                       // Bodleian SOLO catalog — search for Sefer HaYashar
  'S-0053': 'https://archive.org/details/bookjasher00unkngoog',      // Book of Jasher on Internet Archive (1840 edition)
  'S-0054': 'https://en.wikipedia.org/wiki/Nag_Hammadi_library',     // Nag Hammadi — Coptic Museum Cairo (gov.eg domain unreliable)
  'S-0055': 'https://en.wikipedia.org/wiki/Gospel_of_Thomas',        // Gospel of Thomas — same Coptic Museum issue
  'S-0066': 'https://nlr.ru/eng/',                                   // Russian National Library (Leningrad Codex)
  'S-0067': 'https://egymonuments.gov.eg/',                           // Egyptian antiquities — real gov domain
  'S-0072': 'https://nlr.ru/eng/',                                   // Russian National Library (duplicate source)
  'S-0074': 'https://en.wikipedia.org/wiki/Samaritan_Pentateuch',    // No museum site exists — Wikipedia reference
  'S-0080': 'https://www.millisaraylar.gov.tr/saraylar/topkapi-sarayi', // Topkapi Palace — real Turkish gov URL

  // Batch 3 — Domains that don't exist, replaced with real references
  'S-0110': 'https://canmore.org.uk/site/35368/finavon',             // Canmore — Scotland's archaeology DB (Finavon fort)
  'S-0112': 'https://www.museedelhomme.fr/',                         // Musée de l'Homme (real domain)
  'S-0113': 'https://www.ed.ac.uk/geosciences',                     // University of Edinburgh Geosciences
  'S-0119': 'https://www.nhm.ac.uk/our-science/collections',         // Natural History Museum collections
  'S-0125': 'https://www.chicagohistory.org/collection',             // Chicago History Museum collection page
  'S-0127': 'https://www.sos.mo.gov/archives',                      // Missouri State Archives
  'S-0128': 'https://www.bl.uk/collection-guides',                  // British Library collection guides
  'S-0129': 'https://www.vam.ac.uk/collections',                    // V&A Museum collections
  'S-0135': 'https://en.wikipedia.org/wiki/Ethiopian_National_Archives', // Ethiopian National Archives — no stable domain
};

// ── Find and repair source files ──
function listMd(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...listMd(join(dir, e.name)));
    else if (e.name.endsWith('.md') && e.name !== 'TEMPLATE.md') out.push(join(dir, e.name));
  }
  return out;
}

const sourceFiles = listMd(join(ROOT, 'sources'));
let repaired = 0;
let skipped = 0;

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf-8');
  // Extract source ID from filename
  const idMatch = file.match(/[/\\](S-\d+)/);
  if (!idMatch) continue;
  const id = idMatch[1];
  
  if (!REPAIRS[id]) continue;
  
  const newUrl = REPAIRS[id];
  
  // Replace verify-at line in frontmatter
  const verifyAtRegex = /^verify-at:\s*.+$/m;
  const lineEnding = text.includes('\r\n') ? '\r\n' : '\n';
  if (verifyAtRegex.test(text)) {
    const newText = text.replace(verifyAtRegex, `verify-at: ${newUrl}`);
    if (newText !== text) {
      writeFileSync(file, newText);
      console.log(`✓ ${id}: verify-at → ${newUrl}`);
      repaired++;
    } else {
      console.log(`⊘ ${id}: already correct`);
      skipped++;
    }
  } else {
    // Also replace verification_url if it exists (daemon-era field name)
    const verUrlRegex = /^verification_url:\s*.+$/m;
    if (verUrlRegex.test(text)) {
      const newText = text.replace(verUrlRegex, `verify-at: ${newUrl}`);
      writeFileSync(file, newText);
      console.log(`✓ ${id}: verification_url → verify-at: ${newUrl}`);
      repaired++;
    } else {
      // No verify-at line — add it before closing ---
      const fmEnd = text.search(/\r?\n---/);
      if (fmEnd > 0) {
        const newText = text.slice(0, fmEnd) + `${lineEnding}verify-at: ${newUrl}` + text.slice(fmEnd);
        writeFileSync(file, newText);
        console.log(`+ ${id}: added verify-at → ${newUrl}`);
        repaired++;
      } else {
        console.log(`✗ ${id}: no frontmatter found`);
        skipped++;
      }
    }
  }
}

console.log(`\nDone. Repaired: ${repaired}, Skipped: ${skipped}`);
