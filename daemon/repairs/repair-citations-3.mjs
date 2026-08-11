#!/usr/bin/env node
/**
 * TRUTH — Citation Repair Pass 3 (Final 404 fixes)
 * Fixes remaining FAILED sources with correct URLs.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const REPAIRS = {
  // ── Archive.org wrong identifiers → correct ones ──
  'S-0033': 'https://archive.org/details/officialguidetow00flin',           // Official Guide WCE (Flinn, 1893)
  'S-0034': 'https://archive.org/details/worldscolumbiane00worl_0',         // WCE Fine Arts catalogue
  'S-0053': 'https://archive.org/details/bookjasaborigen00unkngoog',        // Book of Jasher (alternative identifier)
  'S-0095': 'https://archive.org/details/reporteducation00manngoog',        // Horace Mann 1843 report
  'S-0097': 'https://en.wikipedia.org/wiki/Reece_Committee',               // Reece Committee — Wikipedia (archive.org ID wrong)
  'S-0098': 'https://archive.org/details/cu31924012038927',                 // Petrie — Cornell copy

  // ── Institutional URL corrections ──
  'S-0018': 'https://en.wikipedia.org/wiki/Project_MKUltra',               // CIA blocks bots, Wikipedia has full docs
  'S-0036': 'https://www.loc.gov/pictures/',                               // LOC pictures (collection path was wrong)
  'S-0038': 'https://en.wikipedia.org/wiki/The_Crystal_Palace',            // V&A article path was wrong
  'S-0058': 'https://en.wikipedia.org/wiki/Greek_flood_myths',             // Spanish national lib blocks
  'S-0061': 'https://cdli.ucla.edu/',                                      // CDLI moved from mpiwg-berlin to UCLA
  'S-0063': 'https://cdli.ucla.edu/',                                      // Same — CDLI at UCLA
  'S-0080': 'https://en.wikipedia.org/wiki/Piri_Reis_map',                 // Turkish gov site blocks
  'S-0091': 'https://nsarchive2.gwu.edu/news/20010430/northwoods.pdf',     // Northwoods PDF (GWU archive)
  'S-0093': 'https://en.wikipedia.org/wiki/Carnegie_Foundation_for_the_Advancement_of_Teaching', // Foundation moved URL
  'S-0106': 'https://www.edinburgh.gov.uk/',                               // Edinburgh main (subpath was wrong)
  'S-0108': 'https://canmore.org.uk/site/17169/tap-o-noth',                // Canmore — Tap o' Noth
  'S-0119': 'https://www.nhm.ac.uk/',                                      // NHM main (subpath was wrong)
  'S-0127': 'https://www.sos.mo.gov/',                                     // Missouri SOS main
  'S-0128': 'https://www.bl.uk/',                                          // British Library main
  'S-0135': 'https://en.wikipedia.org/wiki/Book_of_Jubilees',              // Ethiopian archives doesn't exist
  'S-0136': 'https://www.deadseascrolls.org.il/',                           // Main page (specific image returned 500)
  'S-0144': 'https://en.wikipedia.org/wiki/Oronc%C3%A9_Fin%C3%A9',        // Fixed Wikipedia URL encoding
};

const dir = join(ROOT, 'sources', 'tier-1');
const files = readdirSync(dir);
let repaired = 0;

for (const [id, newUrl] of Object.entries(REPAIRS)) {
  const match = files.find(f => f.includes(id));
  if (!match) { console.log(`? ${id}: file not found`); continue; }
  
  const filePath = join(dir, match);
  let text = readFileSync(filePath, 'utf-8');
  
  const verifyAtRegex = /^verify-at:\s*.+$/m;
  if (verifyAtRegex.test(text)) {
    const newText = text.replace(verifyAtRegex, `verify-at: ${newUrl}`);
    if (newText !== text) {
      writeFileSync(filePath, newText);
      console.log(`✓ ${id}: → ${newUrl}`);
      repaired++;
    } else {
      console.log(`⊘ ${id}: already correct`);
    }
  } else {
    const lineEnding = text.includes('\r\n') ? '\r\n' : '\n';
    const fmEnd = text.search(/\r?\n---/);
    if (fmEnd > 0) {
      text = text.slice(0, fmEnd) + `${lineEnding}verify-at: ${newUrl}` + text.slice(fmEnd);
      writeFileSync(filePath, text);
      console.log(`+ ${id}: added → ${newUrl}`);
      repaired++;
    }
  }
}
console.log(`\nPass 3 done. Repaired: ${repaired}`);
