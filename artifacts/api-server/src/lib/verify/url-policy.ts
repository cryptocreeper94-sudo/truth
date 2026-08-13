import { promises as dns } from "node:dns";

/**
 * Outbound URL policy for the verification pipeline.
 *
 * yt-dlp runs as a child process and follows redirects on its own, so we
 * cannot intercept every hop. The policy is therefore two layers:
 *
 * 1. An explicit allowlist of known video platforms — the URL's hostname
 *    must be one of these domains (or a subdomain). Arbitrary hosts are
 *    rejected outright, so the API cannot be pointed at internal services.
 * 2. Defense in depth: the hostname is resolved and every A/AAAA record is
 *    checked against loopback / private / link-local / reserved ranges
 *    before yt-dlp is invoked.
 */

const ALLOWED_PLATFORM_DOMAINS = [
  // major platforms
  "youtube.com",
  "youtu.be",
  "facebook.com",
  "fb.watch",
  "rumble.com",
  "vimeo.com",
  "dailymotion.com",
  "dai.ly",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "twitch.tv",
  // alt / archival platforms
  "odysee.com",
  "bitchute.com",
  "brighteon.com",
  "banned.video",
  "archive.org",
  "streamable.com",
  "vk.com",
  "ok.ru",
] as const;

/** True if hostname equals or is a subdomain of an allowlisted domain. */
export function isAllowedPlatformHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  return ALLOWED_PLATFORM_DOMAINS.some(
    (d) => h === d || h.endsWith(`.${d}`),
  );
}

/** Human-readable list for error messages ("YouTube, Facebook, Rumble…"). */
export const SUPPORTED_PLATFORMS_HINT =
  "YouTube, Facebook, Rumble, Vimeo, Dailymotion, TikTok, X, Instagram, Twitch, Odysee, BitChute, archive.org, and a few others";

// ── IP range checks (mirrors the SSRF policy used by the compose route) ────

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
    return true; // malformed → block
  const [a, b, c, d] = parts as [number, number, number, number];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && b >= 18 && b <= 19) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224 ||
    (a === 255 && b === 255 && c === 255 && d === 255)
  );
}

function expandIPv6(raw: string): number[] | null {
  let addr = raw.replace(/^\[|\]$/g, "").toLowerCase();
  const zone = addr.indexOf("%");
  if (zone !== -1) addr = addr.slice(0, zone);

  const ipv4Tail = addr.match(
    /^((?:[0-9a-f]*:)*:?)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/,
  );
  if (ipv4Tail) {
    const v4Parts = ipv4Tail[2]!.split(".").map(Number);
    if (v4Parts.some((p) => p < 0 || p > 255)) return null;
    const hi = (v4Parts[0]! << 8) | v4Parts[1]!;
    const lo = (v4Parts[2]! << 8) | v4Parts[3]!;
    addr = ipv4Tail[1] + hi.toString(16) + ":" + lo.toString(16);
    addr = addr.replace(/:$/, "");
  }

  const halves = addr.split("::");
  if (halves.length > 2) return null;

  const parseGroups = (s: string): number[] | null => {
    if (s === "") return [];
    const gs = s.split(":").map((g) => parseInt(g, 16));
    if (gs.some((g) => isNaN(g) || g < 0 || g > 0xffff)) return null;
    return gs;
  };

  const left = parseGroups(halves[0] ?? "");
  const right = halves[1] !== undefined ? parseGroups(halves[1]) : [];
  if (left === null || right === null) return null;

  if (halves.length === 1) {
    return left.length === 8 ? left : null;
  }
  const missing = 8 - left.length - right.length;
  if (missing < 0) return null;
  return [...left, ...Array(missing).fill(0), ...right];
}

function embeddedV4(hi: number, lo: number): string {
  return `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;
}

function isPrivateIpv6(ip: string): boolean {
  const groups = expandIPv6(ip);
  if (!groups) return true; // malformed → block
  const [g0, g1] = [groups[0]!, groups[1]!];

  // ::  and ::1 (unspecified / loopback)
  if (groups.every((g) => g === 0)) return true;
  if (groups.slice(0, 7).every((g) => g === 0) && groups[7] === 1) return true;
  // IPv4-mapped ::ffff:a.b.c.d
  if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {
    return isPrivateIpv4(embeddedV4(groups[6]!, groups[7]!));
  }
  // IPv4-compatible ::a.b.c.d (deprecated ::/96) — e.g. ::127.0.0.1
  if (groups.slice(0, 6).every((g) => g === 0)) {
    return isPrivateIpv4(embeddedV4(groups[6]!, groups[7]!));
  }
  // fc00::/7 unique local
  if ((g0 & 0xfe00) === 0xfc00) return true;
  // fe80::/10 link-local
  if ((g0 & 0xffc0) === 0xfe80) return true;
  // ff00::/8 multicast
  if ((g0 & 0xff00) === 0xff00) return true;
  // 2001:db8::/32 documentation
  if (g0 === 0x2001 && g1 === 0x0db8) return true;
  // 64:ff9b::/96 NAT64 → check embedded IPv4
  if (g0 === 0x0064 && g1 === 0xff9b) {
    return isPrivateIpv4(embeddedV4(groups[6]!, groups[7]!));
  }
  // 2002::/16 6to4 → embedded IPv4 in groups 1-2
  if (g0 === 0x2002) {
    return isPrivateIpv4(embeddedV4(groups[1]!, groups[2]!));
  }
  // 2001:0::/32 Teredo → server IPv4 in groups 2-3, client IPv4 XOR-ed in 6-7
  if (g0 === 0x2001 && g1 === 0x0000) {
    return (
      isPrivateIpv4(embeddedV4(groups[2]!, groups[3]!)) ||
      isPrivateIpv4(
        embeddedV4(groups[6]! ^ 0xffff, groups[7]! ^ 0xffff),
      )
    );
  }
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  return ip.includes(":") ? isPrivateIpv6(ip) : isPrivateIpv4(ip);
}

/**
 * Resolve the hostname and return true only when every resolved address is
 * public. Resolution failures return false (block).
 */
export async function resolvesToPublicAddresses(
  hostname: string,
): Promise<boolean> {
  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    return false;
  }
  if (addrs.length === 0) return false;
  return addrs.every((a) => !isPrivateAddress(a.address));
}
