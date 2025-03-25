import { randomUUID } from "node:crypto";
import type { Predicate } from "@hirosystems/chainhook-client";
import { env } from "~/env";
import { consola } from "./consola";

export const getChainhooks = async (): Promise<
  { name: string; uuid: string }[]
> => {
  const chainhooks = await fetch(
    `https://api.platform.hiro.so/v1/ext/${env.HIRO_API_KEY}/chainhooks`,
    {
      method: "GET",
    },
  ).then((res) => res.json());
  return chainhooks;
};

export const createChainhook = async (
  predicate: unknown,
): Promise<{
  status: string;
  chainhookUuid: string;
}> => {
  const response: {
    status: string;
    chainhookUuid: string;
  } = await fetch(
    `https://api.platform.hiro.so/v1/ext/${env.HIRO_API_KEY}/chainhooks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(predicate),
    },
  ).then((res) => res.json());
  if (response.status !== "success") {
    consola.error("Chainhook creation failed", response);
    throw new Error("Chainhook creation failed");
  }
  return response;
};

/**
 * Prepare the predicate to be sent to the chainhook API.
 */
export const preparePredicate = (predicate: Predicate) => {
  const predicateBody = predicate.networks[env.STACKS_ENV];
  if (predicateBody && "http_post" in predicateBody.then_that) {
    predicateBody.then_that.http_post.url =
      predicateBody.then_that.http_post.url.replace(
        "{__BASE_URL__}",
        env.NODE_ENV === "development" ? env.WEBHOOK_PROXY_URL! : env.API_URL,
      );

    predicateBody.then_that.http_post.authorization_header =
      predicateBody.then_that.http_post.authorization_header.replace(
        "{__TOKEN__}",
        env.CHAINHOOK_API_TOKEN,
      );
  }
  predicate.networks[env.STACKS_ENV] = predicateBody;
  return predicate;
};

export const createPredicate = (
  predicate: Omit<Predicate, "uuid">,
): Predicate => {
  return {
    uuid: randomUUID(),
    name: predicate.name,
    version: predicate.version,
    chain: predicate.chain,
    networks: {
      [env.STACKS_ENV]: predicate.networks.testnet,
    },
  };
};
