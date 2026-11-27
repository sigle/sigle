import type { LookupFunction } from "node:net";
import { Data } from "effect";
import { lookup as dnsLookup } from "node:dns";
import { request } from "node:https";
import { BlockList, isIPv4, isIPv6 } from "node:net";

/** Loopback, link-local, private and reserved networks. */
const blockedAddresses = new BlockList();

for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blockedAddresses.addSubnet(network, prefix, "ipv4");
}

for (const [network, prefix] of [
  ["::", 96],
  ["64:ff9b::", 96],
  ["100::", 64],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  blockedAddresses.addSubnet(network, prefix, "ipv6");
}

export interface IpLiteral {
  readonly address: string;
  readonly family: "ipv4" | "ipv6";
}

/**
 * Parses an IP address, bracketed or not, with an IPv4-mapped IPv6 address
 * read as its IPv4 address. Returns `null` for anything else.
 */
export const parseIpLiteral = (hostname: string): IpLiteral | null => {
  const address =
    hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;

  if (isIPv4(address)) {
    return { address, family: "ipv4" };
  }

  if (isIPv6(address)) {
    const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(address);

    if (mapped?.[1] !== undefined && isIPv4(mapped[1])) {
      return { address: mapped[1], family: "ipv4" };
    }

    return { address, family: "ipv6" };
  }

  return null;
};

export const isBlockedAddress = (literal: IpLiteral): boolean =>
  blockedAddresses.check(literal.address, literal.family);

/** A hostname resolved to an address that `isBlockedAddress` refuses. */
export class BlockedAddressError extends Data.TaggedError(
  "BlockedAddressError",
)<{
  readonly hostname: string;
  readonly address: string;
  readonly message: string;
}> {}

/**
 * Resolves like `dns.lookup`, but fails when any address of the hostname is
 * blocked. The connection uses the address returned here, so a hostname
 * cannot pass this check and then resolve to another address.
 */
const lookupPublicAddress: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error !== null) {
      callback(error, "");

      return;
    }

    const blocked = addresses.find((entry) => {
      const literal = parseIpLiteral(entry.address);

      return literal === null || isBlockedAddress(literal);
    });

    const [first] = addresses;

    if (blocked !== undefined || first === undefined) {
      const address = blocked?.address ?? "none";

      callback(
        new BlockedAddressError({
          hostname,
          address,
          message: `${hostname} resolves to a blocked address: ${address}`,
        }),
        "",
      );

      return;
    }

    if (options.all === true) {
      callback(null, addresses);
    } else {
      callback(null, first.address, first.family);
    }
  });
};

// Statuses whose response cannot have a body (Fetch standard).
const nullBodyStatuses = new Set([204, 205, 304]);

/**
 * GETs an https URL whose host resolves only to public addresses, else fails
 * with `BlockedAddressError`. Redirects are not followed: the caller sees the
 * redirect response, like `fetch` with `redirect: "manual"`.
 */
export const fetchPublicHttps = (
  url: URL,
  init: { readonly signal: AbortSignal },
): Promise<Response> => {
  const { promise, resolve, reject } = Promise.withResolvers<Response>();

  const outgoing = request(
    url,
    {
      headers: { "user-agent": "Sigle" },
      lookup: lookupPublicAddress,
      signal: init.signal,
    },
    (incoming) => {
      const status = incoming.statusCode ?? 502;
      const headers = new Headers();

      for (const [name, value] of Object.entries(incoming.headers)) {
        for (const item of Array.isArray(value) ? value : [value]) {
          if (item !== undefined) {
            headers.append(name, item);
          }
        }
      }

      if (nullBodyStatuses.has(status)) {
        incoming.resume();
        resolve(new Response(null, { status, headers }));

        return;
      }

      // Pulled chunk by chunk, so a reader that stops reading stops the
      // download, and cancelling the stream destroys the response.
      const chunks: AsyncIterator<Uint8Array> =
        incoming[Symbol.asyncIterator]();

      const body = new ReadableStream<Uint8Array>({
        pull: async (controller) => {
          const chunk = await chunks.next();

          if (chunk.done === true) {
            controller.close();
          } else {
            controller.enqueue(chunk.value);
          }
        },
        cancel: async () => {
          await chunks.return?.();
        },
      });

      resolve(new Response(body, { status, headers }));
    },
  );

  outgoing.on("error", reject);
  outgoing.end();

  return promise;
};
