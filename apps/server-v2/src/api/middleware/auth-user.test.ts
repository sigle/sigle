import { describe, expect, it } from "@effect/vitest";
import { Effect, Ref, Schema } from "effect";
import {
  Cookies,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";
import {
  createTestSiwsCredentials,
  createTestSiwsMessage,
  signTestSiwsMessage,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const NonceResponse = Schema.Struct({ nonce: Schema.String });

const VerifyResponse = Schema.Struct({
  user: Schema.Struct({ id: Schema.String }),
});

const CurrentUserResponse = Schema.Struct({ id: Schema.String });

const ErrorResponse = Schema.Struct({ message: Schema.String });

const withCookies = Effect.gen(function* () {
  const cookies = yield* Ref.make(Cookies.empty);

  return (yield* HttpClient.HttpClient).pipe(
    HttpClient.withCookiesRef(cookies),
  );
});

const authenticate = (
  client: HttpClient.HttpClient,
  credentials: ReturnType<typeof createTestSiwsCredentials>,
) =>
  Effect.gen(function* () {
    const nonceResponse = yield* client.execute(
      HttpClientRequest.post("/api/auth/siws/nonce").pipe(
        HttpClientRequest.bodyJsonUnsafe({}),
      ),
    );

    const { nonce } =
      yield* HttpClientResponse.schemaBodyJson(NonceResponse)(nonceResponse);

    const message = createTestSiwsMessage({
      address: credentials.address,
      nonce,
      chainId: credentials.chainId,
    });

    const signature = signTestSiwsMessage(message, credentials.privateKey);

    const verifyResponse = yield* client.execute(
      HttpClientRequest.post("/api/auth/siws/verify").pipe(
        HttpClientRequest.bodyJsonUnsafe({ message, signature }),
      ),
    );

    const body =
      yield* HttpClientResponse.schemaBodyJson(VerifyResponse)(verifyResponse);

    return body.user.id;
  });

describe("userAuthMiddleware", () => {
  it.effect("returns 401 when no session is provided", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* client.get("/api/protected/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect(response.status).toBe(401);
      expect(body.message).toBe("Unauthorized");
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("returns 403 when the user is not whitelisted", () =>
    Effect.gen(function* () {
      const client = yield* withCookies;
      const credentials = createTestSiwsCredentials("mainnet");

      yield* authenticate(client, credentials);

      const response = yield* client.get("/api/protected/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect(response.status).toBe(403);
      expect(body.message).toBe("User is not whitelisted");
    }).pipe(Effect.provide(makeTestServerLayer({ STACKS_ENV: "mainnet" }))),
  );

  it.effect("provides the current user for whitelisted users", () =>
    Effect.gen(function* () {
      const client = yield* withCookies;
      const credentials = createTestSiwsCredentials();

      const userId = yield* authenticate(client, credentials);

      const response = yield* client.get("/api/protected/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(CurrentUserResponse)(response);

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({ id: userId });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
