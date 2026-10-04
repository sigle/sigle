import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
import { AuthService } from "@/services/auth";

const webResponseToHttpResponse = (
  response: Response,
): Effect.Effect<HttpServerResponse.HttpServerResponse> =>
  Effect.promise(async () => {
    const body = new Uint8Array(await response.arrayBuffer());
    const setCookie = response.headers.getSetCookie();

    return HttpServerResponse.uint8Array(body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        "set-cookie": setCookie.length > 0 ? setCookie : undefined,
      },
    });
  });

export const AuthRoutesLayer = Layer.unwrap(
  Effect.gen(function* () {
    const auth = yield* AuthService;

    return HttpRouter.add("*", "/api/auth/*", (request) =>
      Effect.gen(function* () {
        const webRequest = yield* HttpServerRequest.toWeb(request);
        const webResponse = yield* auth.handler(webRequest);

        return yield* webResponseToHttpResponse(webResponse);
      }),
    );
  }),
);
