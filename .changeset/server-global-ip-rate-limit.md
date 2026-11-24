---
"@sigle/server": patch
---

Limit each client IP to 300 API requests a minute across all endpoints, signed in or not, on top of the per-endpoint limits. Before, a client got 60 requests a minute on every endpoint, about 1,200 in total, and every free account got its own limits. IPv6 clients are now limited by their /64, so rotating addresses within it no longer gives fresh limits, and IPv4-mapped IPv6 addresses share their IPv4 address's limits.
