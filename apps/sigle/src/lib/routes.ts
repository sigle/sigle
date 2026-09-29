"use client";

import {
  type ReadonlyURLSearchParams,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import queryString from "query-string";
import { z } from "zod";

export const Routes = {
  home: makeRoute(() => "/"),
  explore: makeRoute(() => "/explore"),
  userProfile: makeRoute(
    ({ username }) => `/u/${username}`,
    z.object({
      username: z.string(),
    }),
  ),
  post: makeRoute(
    ({ postId }) => `/p/${postId}`,
    z.object({
      postId: z.string(),
    }),
    z.object({
      referral: z.string().optional().nullable(),
      published: z.boolean().optional(),
    }),
  ),
  // Logged in routes
  dashboard: makeRoute(() => "/dashboard"),
  editPost: makeRoute(
    ({ postId }) => `/p/${postId}/edit`,
    z.object({
      postId: z.string(),
    }),
    z.object({
      // This option is used for the migration, to force the post html to be converted to markdown
      // Once the migration is done, we can remove this option
      forceSave: z.string().optional().nullable(),
    }),
  ),
};

interface RouteBuilder<Params extends z.ZodSchema, Search extends z.ZodSchema> {
  (p?: z.input<Params>, options?: { search?: z.input<Search> }): string;
  parse: (input: z.input<Params>) => z.output<Params>;
  useParams: () => z.output<Params>;
  useSearchParams: () => z.output<Search>;
  params: z.output<Params>;
}

function findRouteName<Params extends z.ZodSchema, Search extends z.ZodSchema>(
  routeBuilder: RouteBuilder<Params, Search>,
): string {
  return (
    Object.entries(Routes).find(([, route]) =>
      Object.is(route, routeBuilder),
    )?.[0] ?? "(unknown route)"
  );
}

function makeRoute<Params extends z.ZodSchema, Search extends z.ZodSchema>(
  fn: (p: z.input<Params>) => string,
  // SAFETY: routes without params default to a type-only placeholder schema;
  // parse/useParams are only invoked on routes that declare a real schema.
  paramsSchema: Params = {} as Params,
  // SAFETY: routes without search params default to a type-only placeholder
  // schema; parse/useSearchParams are only invoked on routes that declare one.
  search: Search = {} as Search,
): RouteBuilder<Params, Search> {
  const routeBuilder: RouteBuilder<Params, Search> = (params, options) => {
    // SAFETY: `params` is optional so parameterless routes can call the
    // builder; only routes whose `fn` reads params are called with one.
    const baseUrl = fn(params as z.input<Params>);

    const searchString =
      options?.search && queryString.stringify(options.search);

    return [baseUrl, searchString ? `?${searchString}` : ""].join("");
  };

  routeBuilder.parse = function parse(args: z.input<Params>): z.output<Params> {
    const res = paramsSchema.safeParse(args);

    if (!res.success) {
      const routeName = findRouteName(routeBuilder);

      throw new Error(
        `Invalid search params for route ${routeName}: ${res.error.message}`,
      );
    }

    return res.data;
  };

  routeBuilder.useParams = function useParams(): z.output<Params> {
    const res = paramsSchema.safeParse(useNextParams());

    if (!res.success) {
      const routeName = findRouteName(routeBuilder);

      throw new Error(
        `Invalid route params for route ${routeName}: ${res.error.message}`,
      );
    }

    return res.data;
  };

  routeBuilder.useSearchParams = function useSearchParams(): z.output<Search> {
    const res = search.safeParse(
      convertURLSearchParamsToObject(useNextSearchParams()),
    );

    if (!res.success) {
      const routeName = findRouteName(routeBuilder);

      throw new Error(
        `Invalid route params for route ${routeName}: ${res.error.message}`,
      );
    }

    return res.data;
  };

  // SAFETY: `params` is a type-level placeholder; the runtime getter installed
  // immediately below throws for every access, so this value is never read.
  routeBuilder.params = undefined as z.output<Params>;
  // set the runtime getter
  Object.defineProperty(routeBuilder, "params", {
    get() {
      throw new Error(
        "Routes.[route].params is only for type usage, not runtime. Use it like `typeof Routes.[routes].params`",
      );
    },
  });

  return routeBuilder;
}

export function convertURLSearchParamsToObject(
  params: ReadonlyURLSearchParams | null,
): Record<string, string | string[]> {
  if (!params) {
    return {};
  }

  const entries: [string, string | string[]][] = [];

  for (const key of params.keys()) {
    const values = params.getAll(key);

    entries.push([key, values.length > 1 ? values : (values[0] ?? "")]);
  }

  return Object.fromEntries(entries);
}
