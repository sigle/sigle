"use client";

import { IconPlus } from "@tabler/icons-react";
import { GetFamiliarCards } from "@/components/Dashboard/GetFamiliarCards";
import { WritingList } from "@/components/Dashboard/WritingList";
import { NextLink } from "@/components/Shared/NextLink";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";

export default function Dashboard() {
  const { data: me } = sigleApiClient.useQuery("get", "/api/me");

  const drafts = sigleApiClient.useQuery("get", "/api/drafts", {
    params: { query: { limit: 5 } },
  });

  const posts = sigleApiClient.useQuery(
    "get",
    "/api/me/posts",
    { params: { query: { limit: 5 } } },
    { enabled: !!me },
  );

  const isEmpty = drafts.data?.total === 0 && posts.data?.total === 0;

  return (
    <div className="space-y-12 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="headline text-3xl">Dashboard</h2>
          {me ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {me.plan === "pro" ? (
                "Pro plan"
              ) : (
                <>
                  Free plan ·{" "}
                  <NextLink
                    href="/dashboard/plan"
                    className="text-foreground underline underline-offset-4"
                  >
                    Upgrade to Pro
                  </NextLink>
                </>
              )}
            </p>
          ) : null}
        </div>

        {me && !isEmpty ? (
          <NextLink href="/p/new" className={buttonVariants()}>
            <IconPlus />
            New post
          </NextLink>
        ) : null}
      </div>

      {me && isEmpty ? (
        <section className="border-y border-border py-14 text-center">
          <h3 className="headline text-2xl">Write your first story</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-muted-foreground">
            Drafts save as you type. When you publish, your story is archived on
            Arweave and timestamped on Bitcoin.
          </p>
          <NextLink
            href="/p/new"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            Start writing
          </NextLink>
        </section>
      ) : null}

      {me && !isEmpty ? (
        <>
          <WritingList
            title="Drafts"
            total={drafts.data?.total}
            action={{ label: "View all", href: "/dashboard/drafts" }}
            items={drafts.data?.results.map((draft) => ({
              id: draft.id,
              title: draft.metaTitle || draft.title,
              href: Routes.editPost({ postId: draft.id }),
              date: draft.updatedAt,
            }))}
            isLoading={drafts.isLoading}
            error={drafts.error}
            emptyLabel="No drafts in progress."
          />

          <WritingList
            title="Published"
            total={posts.data?.total}
            action={{ label: "View all", href: "/dashboard/published" }}
            items={posts.data?.results.map((post) => ({
              id: post.id,
              title: post.metaTitle || post.title,
              // A hidden story has no page, its row is on the Published list.
              href:
                post.hiddenAt === null
                  ? Routes.post({ postId: post.id })
                  : "/dashboard/published",
              date: post.createdAt,
              label: post.hiddenAt === null ? undefined : "Hidden",
            }))}
            isLoading={posts.isLoading}
            error={posts.error}
            emptyLabel="Nothing published yet."
          />
        </>
      ) : null}

      <GetFamiliarCards />
    </div>
  );
}
