"use client";

import { IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { GetFamiliarCards } from "@/components/Dashboard/GetFamiliarCards";
import { WritingList } from "@/components/Dashboard/WritingList";
import { NextLink } from "@/components/Shared/NextLink";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";

export default function Dashboard() {
  const { data: me, isLoading: isLoadingMe } = sigleApiClient.useQuery(
    "get",
    "/api/me",
  );

  const canWrite = me?.whitelisted === true;

  const drafts = sigleApiClient.useQuery(
    "get",
    "/api/drafts",
    { params: { query: { limit: 5 } } },
    { enabled: canWrite },
  );

  const posts = sigleApiClient.useQuery(
    "get",
    "/api/posts",
    { params: { query: { author: me?.address ?? "", limit: 5 } } },
    { enabled: canWrite },
  );

  const isEmpty = drafts.data?.total === 0 && posts.data?.total === 0;

  return (
    <div className="space-y-12 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="headline text-3xl">Dashboard</h2>
          {canWrite ? (
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

        {canWrite && !isEmpty ? (
          <NextLink href="/p/new" className={buttonVariants()}>
            <IconPlus />
            New post
          </NextLink>
        ) : null}
      </div>

      {!isLoadingMe && !canWrite ? (
        <Alert>
          <IconInfoCircle />
          <AlertDescription>
            Publishing is currently restricted to whitelisted users only. If you
            are interested in participating in the Sigle beta, please let us
            know on Discord.
          </AlertDescription>
        </Alert>
      ) : null}

      {canWrite && isEmpty ? (
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

      {canWrite && !isEmpty ? (
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
            action={{
              label: "View blog",
              href: Routes.userProfile({ username: me.address }),
            }}
            items={posts.data?.results.map((post) => ({
              id: post.id,
              title: post.metaTitle || post.title,
              href: Routes.post({ postId: post.id }),
              date: post.createdAt,
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
