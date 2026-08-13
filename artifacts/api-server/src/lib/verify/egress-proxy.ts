import http from "node:http";
import net from "node:net";
import { promises as dns } from "node:dns";
import { isPrivateAddress } from "./url-policy";

/**
 * Local SSRF-guard egress proxy for yt-dlp.
 *
 * yt-dlp resolves hosts and follows redirects on its own, so validating only
 * the submitted URL is not enough: an allowlisted platform's redirect
 * endpoint (or a DNS-rebinding host) could send the downloader to an
 * internal address. To close that hole, every yt-dlp invocation is pointed
 * at this proxy (`--proxy http://127.0.0.1:<port>`), which enforces the
 * outbound policy on EVERY connection — including redirect hops and
 * extractor-provided CDN/media URLs:
 *
 *  - only ports 80 and 443 are allowed;
 *  - the target hostname is resolved here, and every resolved address must
 *    be public (no loopback / private / link-local / mapped / reserved);
 *  - the upstream connection is made to the exact IP address that passed
 *    validation, so a rebinding DNS record cannot swap in a private address
 *    after the check.
 *
 * The proxy listens on 127.0.0.1 only and is created lazily per process.
 */

const ALLOWED_PORTS = new Set([80, 443]);
const CONNECT_TIMEOUT_MS = 15_000;

/**
 * Resolve a target host and return one validated public IP to connect to.
 * Returns null when the host is invalid, unresolvable, or any resolved
 * address is non-public.
 */
async function resolvePublicTarget(host: string): Promise<string | null> {
  // Literal IP (v4 or bracketless v6): validate directly.
  if (net.isIP(host)) {
    return isPrivateAddress(host) ? null : host;
  }
  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(host, { all: true, verbatim: true });
  } catch {
    return null;
  }
  if (addrs.length === 0) return null;
  if (addrs.some((a) => isPrivateAddress(a.address))) return null;
  return addrs[0]!.address;
}

function parseHostPort(
  raw: string,
): { host: string; port: number } | null {
  // CONNECT target form: host:port, [v6]:port
  const m = raw.match(/^\[([^\]]+)\]:(\d+)$/) ?? raw.match(/^([^:]+):(\d+)$/);
  if (!m) return null;
  const port = Number(m[2]);
  if (!Number.isInteger(port)) return null;
  return { host: m[1]!, port };
}

export interface EgressProxy {
  port: number;
  url: string;
  close: () => Promise<void>;
}

export async function startEgressProxy(): Promise<EgressProxy> {
  const server = http.createServer();

  // HTTPS tunneling: CONNECT host:port
  server.on("connect", (req, clientSocket) => {
    void (async () => {
      const target = parseHostPort(req.url ?? "");
      if (!target || !ALLOWED_PORTS.has(target.port)) {
        clientSocket.end("HTTP/1.1 403 Forbidden\r\n\r\n");
        return;
      }
      const ip = await resolvePublicTarget(target.host);
      if (!ip) {
        clientSocket.end("HTTP/1.1 403 Forbidden\r\n\r\n");
        return;
      }
      const upstream = net.connect({
        host: ip, // exact validated IP — immune to rebinding
        port: target.port,
        timeout: CONNECT_TIMEOUT_MS,
      });
      upstream.once("connect", () => {
        upstream.setTimeout(0);
        clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
        upstream.pipe(clientSocket);
        clientSocket.pipe(upstream);
      });
      const abort = () => {
        upstream.destroy();
        clientSocket.destroy();
      };
      upstream.once("timeout", abort);
      upstream.once("error", abort);
      clientSocket.once("error", abort);
    })().catch(() => clientSocket.destroy());
  });

  // Plain HTTP proxying: absolute-URI requests
  server.on("request", (req, res) => {
    void (async () => {
      let parsed: URL;
      try {
        parsed = new URL(req.url ?? "");
      } catch {
        res.writeHead(400).end();
        return;
      }
      if (parsed.protocol !== "http:") {
        res.writeHead(403).end();
        return;
      }
      const port = parsed.port ? Number(parsed.port) : 80;
      if (!ALLOWED_PORTS.has(port)) {
        res.writeHead(403).end();
        return;
      }
      const ip = await resolvePublicTarget(parsed.hostname);
      if (!ip) {
        res.writeHead(403).end();
        return;
      }
      const headers = { ...req.headers };
      delete headers["proxy-connection"];
      const upstream = http.request(
        {
          host: ip, // exact validated IP
          port,
          method: req.method,
          path: parsed.pathname + parsed.search,
          headers: { ...headers, host: parsed.host },
          timeout: CONNECT_TIMEOUT_MS,
        },
        (upRes) => {
          res.writeHead(upRes.statusCode ?? 502, upRes.headers);
          upRes.pipe(res);
        },
      );
      upstream.once("timeout", () => upstream.destroy());
      upstream.once("error", () => {
        if (!res.headersSent) res.writeHead(502);
        res.end();
      });
      req.pipe(upstream);
    })().catch(() => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Egress proxy failed to bind");
  }
  return {
    port: address.port,
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  };
}

// ── lazy per-process singleton ──────────────────────────────────────────────
let proxyPromise: Promise<EgressProxy> | null = null;

/** Get (starting if needed) the shared egress proxy for yt-dlp calls. */
export function getEgressProxy(): Promise<EgressProxy> {
  if (!proxyPromise) {
    proxyPromise = startEgressProxy().catch((err) => {
      proxyPromise = null; // allow retry on next call
      throw err;
    });
  }
  return proxyPromise;
}
