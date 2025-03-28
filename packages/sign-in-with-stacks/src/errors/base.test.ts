import { expect, test } from "vitest";
import { BaseError, setErrorConfig } from "./base.js";

test("BaseError", () => {
  expect(new BaseError("An error occurred.")).toMatchInlineSnapshot(`
    [BaseError: An error occurred.]
  `);

  expect(
    new BaseError("An error occurred.", { details: "details" }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.
    Details: details]
  `);

  expect(new BaseError("", { details: "details" })).toMatchInlineSnapshot(`
    [BaseError: An error occurred.
    Details: details]
  `);
});

test("BaseError (w/ docsPath)", () => {
  expect(
    new BaseError("An error occurred.", {
      details: "details",
      docsPath: "/lol",
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.
    Docs: https://viem.sh/lol
    Details: details]
  `);
  expect(
    new BaseError("An error occurred.", {
      cause: new BaseError("error", { docsPath: "/docs" }),
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.
    Docs: https://viem.sh/docs]
  `);
  expect(
    new BaseError("An error occurred.", {
      cause: new BaseError("error"),
      docsPath: "/lol",
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.
    Docs: https://viem.sh/lol]
  `);
  expect(
    new BaseError("An error occurred.", {
      details: "details",
      docsPath: "/lol",
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.
    Docs: https://viem.sh/lol
    Details: details]
  `);
});

test("BaseError (w/ docsBaseUrl)", () => {
  expect(
    new BaseError("An error occurred.", {
      docsBaseUrl: "https://test",
      details: "details",
      docsPath: "/lol",
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.
    Docs: https://test/lol
    Details: details]
  `);
});

test("BaseError (w/ metaMessages)", () => {
  expect(
    new BaseError("An error occurred.", {
      details: "details",
      metaMessages: ["Reason: idk", "Cause: lol"],
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.
    Reason: idk
    Cause: lol
    Details: details]
  `);
});

test("inherited BaseError", () => {
  const err = new BaseError("An error occurred.", {
    details: "details",
    docsPath: "/lol",
  });
  expect(
    new BaseError("An internal error occurred.", {
      cause: err,
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An internal error occurred.
    Docs: https://viem.sh/lol
    Details: details]
  `);
});

test("inherited Error", () => {
  const err = new Error("details");
  expect(
    new BaseError("An internal error occurred.", {
      cause: err,
      docsPath: "/lol",
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An internal error occurred.
    Docs: https://viem.sh/lol
    Details: details]
  `);
});

test("walk: no predicate fn (walks to leaf)", () => {
  class FooError extends BaseError {}
  class BarError extends BaseError {}

  const err = new BaseError("test1", {
    cause: new FooError("test2", { cause: new BarError("test3") }),
  });
  expect(err.walk()).toMatchInlineSnapshot(`
    [BaseError: test3]
  `);
});

test("walk: predicate fn", () => {
  class FooError extends BaseError {}
  class BarError extends BaseError {}

  const err = new BaseError("test1", {
    cause: new FooError("test2", { cause: new BarError("test3") }),
  });
  expect(err.walk((err) => err instanceof FooError)).toMatchInlineSnapshot(`
    [BaseError: test2]
  `);
});

test("walk: predicate fn (no match)", () => {
  class FooError extends BaseError {}
  class BarError extends BaseError {}

  const err = new BaseError("test1", {
    cause: new Error("test2", { cause: new BarError("test3") }),
  });
  expect(err.walk((err) => err instanceof FooError)).toBeNull();
});

test("walk: undefined cause", () => {
  const withCauseUndefined = new Error("Cuase undefined", { cause: undefined });

  const err = new BaseError("test1", {
    cause: withCauseUndefined,
  });
  expect(err.walk()).toBe(withCauseUndefined);
});

test("setErrorConfig", () => {
  class FooError extends BaseError {
    constructor() {
      super("An error occurred", {
        name: "FooError",
      });
    }
  }

  setErrorConfig({
    getDocsUrl({ name }) {
      if (name === "FooError") return "https://sweetlib.com/xyz";
      return undefined;
    },
  });

  expect(new BaseError("An error occurred.")).toMatchInlineSnapshot(`
    [BaseError: An error occurred.]
  `);

  expect(new FooError()).toMatchInlineSnapshot(`
    [FooError: An error occurred
    Docs: https://sweetlib.com/xyz]
  `);
});
