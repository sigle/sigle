import { MeiliSearch } from "meilisearch";

export const meilisearchClient = new MeiliSearch({
  host: "http://meilisearch:7700",
  apiKey: "1JmkmCKvLxP0XkyJNoRttzbC62oDWCh4V4CTypSN8kY",
});

export const meilisearchIndexUser = async (user: {
  id: string;
  displayName?: string;
}) => {
  await meilisearchClient.index("users").addDocuments([user]);
};

export const meilisearchIndexPost = async (post: {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
}) => {
  await meilisearchClient.index("posts").addDocuments([post]);
};
