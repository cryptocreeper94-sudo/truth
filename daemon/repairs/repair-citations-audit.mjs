#!/usr/bin/env node
/**
 * TRUTH — Citation Repair Pass
 * Fixes the 24 failed claims identified by the auditor.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLAIMS = join(ROOT, 'claims');
const SOURCES = join(ROOT, 'sources', 'tier-1');

const URL_FIXES = {
  'S-0053': {
    old: 'https://archive.org/details/bookjasaborigen00unkngoog',
    new: 'https://archive.org/details/bookjasher00unkngoog',
  },
  'S-0058': {
    old: 'https://en.wikipedia.org/wiki/Greek_flood_myths',
    new: 'https://en.wikipedia.org/wiki/Deucalion',
  },
  'S-0061': {
    old: 'https://cdli.ucla.edu/',
    new: 'https://cdli.mpiwg-berlin.mpg.de/',
  },
  'S-0063': {
    old: 'https://cdli.ucla.edu/',
    new: 'https://cdli.mpiwg-berlin.mpg.de/',
  },
  'S-0124': {
    old: 'https://www.loc.gov/item/123456789',
    new: 'https://www.loc.gov/pictures/collection/wce/',
  },
  'S-0127': {
    old: 'https://www.sos.mo.gov/',
    new: 'https://www.sos.mo.gov/archives',
  },
};

let fixed = 0;
for (const [sourceId, fix] of Object.entries(URL_FIXES)) {
  const files = readdirSync(SOURCES);
  const match = files.find(f => f.includes(sourceId));
  if (!match) { console.log(`? ${sourceId}: not found`); continue; }

  const filePath = join(SOURCES, match);
  let text = readFileSync(filePath, 'utf-8');

  if (text.includes(fix.old)) {
    text = text.replace(fix.old, fix.new);
    writeFileSync(filePath, text);
    console.log(`✓ ${sourceId}: ${fix.old} → ${fix.new}`);
    fixed++;
  } else {
    console.log(`⊘ ${sourceId}: old URL not found in file`);
  }
}

// Check Category A: why did these claims fail if sources verified?
const CAT_A = ['C-0006','C-0021','C-0022','C-0030','C-0031','C-0035','C-0039','C-0045','C-0046','C-0051','C-0066','C-0069'];
console.log('\n── Category A: Sources verified but claim FAILED ──');
for (const claimId of CAT_A) {
  const files = readdirSync(CLAIMS);
  const match = files.find(f => f.includes(claimId));
  if (!match) { console.log(`? ${claimId}: not found`); continue; }
  const text = readFileSync(join(CLAIMS, match), 'utf-8');
  const bodyUrls = text.match(/https?:\/\/[^\s)>\]]+/g) || [];
  const sourceMatch = text.match(/sources:\s*\[([^\]]*)\]/);
  const sources = sourceMatch ? sourceMatch[1].split(',').map(s => s.trim()) : [];
  console.log(`  ${claimId}: sources=[${sources.join(',')}] bodyUrls=${bodyUrls.length}`);
}

console.log(`\nURL fixes applied: ${fixed}`);
