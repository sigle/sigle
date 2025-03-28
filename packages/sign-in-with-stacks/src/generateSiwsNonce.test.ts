import { expect, test } from "vitest";
import { generateSiwsNonce } from "./generateSiwsNonce.js";

test("default", () => {
  const nonce = generateSiwsNonce();
  expect(nonce.length).toMatchInlineSnapshot("96");
});
