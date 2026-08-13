---
name: DVE video ingestion constraints
description: Durable constraints for server-side video verification (yt-dlp/whisper pipeline): platform blocking and downloader SSRF policy.
---

# DVE video ingestion constraints

- **Major platforms block datacenter egress.** YouTube, Rumble, and Vimeo refuse server-side yt-dlp requests from this workspace's IPs (bot checks). This is an environment property, not a code bug; broad support requires cookie provisioning or proxy/residential egress. The pipeline surfaces these as honest plain-English "platform is blocking automated access" errors.
- **Downloader SSRF policy must guard every connection, not just the submitted URL.** Code review rejects submit-time-only validation because yt-dlp resolves hosts and follows redirects itself (allowlisted platforms have open-redirect endpoints; DNS rebinding defeats one-time lookups). Accepted pattern: route the downloader through a local egress proxy that re-resolves each target and connects to the exact validated public IP, rejecting private/loopback/link-local ranges and non-80/443 ports — combined with a submit-time platform host allowlist.
- **IPv6 private-address checks must cover transition forms.** Blocking `::1`/`fe80::`/`fc00::` is not enough: IPv4-compatible (`::a.b.c.d`), IPv4-mapped (`::ffff:a.b.c.d`), 6to4 (`2002::/16`), NAT64 (`64:ff9b::/96`), and Teredo (`2001:0::/32`) all embed an IPv4 address that must pass the IPv4 private/reserved checks too, or `::127.0.0.1` bypasses the guard.
- **LLM evidence labels must forbid fabricated URLs** in the prompt and post-filter to https; the labels (DOCUMENTED/…/UNVERIFIABLE) are deliberately separate from Physical Evidence case statuses.
