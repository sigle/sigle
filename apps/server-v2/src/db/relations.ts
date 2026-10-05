import { defineRelations } from "drizzle-orm";
import * as schema from "@/db/schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    walletAddresses: r.many.walletAddress(),
    drafts: r.many.draft(),
    posts: r.many.post(),
    profile: r.one.profile({
      from: r.user.id,
      to: r.profile.userId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  walletAddress: {
    user: r.one.user({
      from: r.walletAddress.userId,
      to: r.user.id,
    }),
    profile: r.one.profile({
      from: r.walletAddress.id,
      to: r.profile.walletAddressId,
    }),
  },
  draft: {
    user: r.one.user({
      from: r.draft.userId,
      to: r.user.id,
    }),
  },
  post: {
    user: r.one.user({
      from: r.post.userId,
      to: r.user.id,
    }),
    ots: r.one.postOts({
      from: r.post.id,
      to: r.postOts.postId,
    }),
  },
  postOts: {
    post: r.one.post({
      from: r.postOts.postId,
      to: r.post.id,
    }),
  },
  profile: {
    user: r.one.user({
      from: r.profile.userId,
      to: r.user.id,
    }),
    walletAddress: r.one.walletAddress({
      from: r.profile.walletAddressId,
      to: r.walletAddress.id,
    }),
  },
}));
