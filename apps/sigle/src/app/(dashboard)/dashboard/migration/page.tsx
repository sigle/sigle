"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Routes } from "@/lib/routes";
import { sigleApiFetchClient } from "@/lib/sigle";

interface Story {
  /**
   * Random id also used in the url
   * Have to be unique
   */
  id: string;
  /**
   * Title of the story
   */
  title: string;
  /**
   * JSON representing the slate.js structure of the story
   */
  // oxlint-disable-next-line no-explicit-any: content is not typed
  content: any;
  /**
   * Version representing the format of the content
   * When the value is not set, we consider it as v1
   * v1: Slate.js JSON
   * v2: TipTap HTML
   */
  contentVersion?: "2";
  /**
   * Image used to display the cards
   */
  coverImage?: string;
  /**
   * Type of the story
   * private: encrypted
   * public: unencrypted
   */
  type: "private" | "public";
  /**
   * Meta title that will be used for SEO
   */
  metaTitle?: string;
  /**
   * Meta description that will be used for SEO
   */
  metaDescription?: string;
  /**
   * Meta image that will be used for SEO
   */
  metaImage?: string;
  /**
   * Canonical URL that will be used for SEO
   */
  canonicalUrl?: string;
  /**
   * Is the story featured. A featured story will be displayed in another way in the list
   * it will also always appear first in the list, no matter the created date
   */
  featured?: boolean;
  /**
   * Hide the cover image on the public story page.
   * The cover image will be used as a thumbnail and SEO only.
   */
  hideCoverImage?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface SubsetStory {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  type: "private" | "public";
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
}

export default function MigrationPage() {
  const [username, setUsername] = useState<{ value: string; ready: boolean }>({
    value: "",
    ready: false,
  });
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);

  const fetchPosts = async (): Promise<SubsetStory[]> => {
    const res = await fetch(`/api/migration/list?username=${username.value}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
    return data;
  };

  const handleMigrate = async (id: string) => {
    setLoadingPostId(id);
    try {
      // 1. Fetch the post from old API
      const res = await fetch(
        `/api/migration/${id}?username=${username.value}`,
      );
      const data: Story = await res.json();
      console.log("handleMigrate", data);

      // 2. Create a new draft
      const { data: newPost, error: newPostError } =
        await sigleApiFetchClient.POST("/api/protected/drafts/create", {});
      if (newPostError) {
        toast.error(newPostError.message);
        return;
      }
      console.log("newPost", newPost);

      // 3. Update the draft with the content from the old post
      const { data: updatePost, error: updatePostError } =
        await sigleApiFetchClient.POST(
          "/api/protected/drafts/{draftId}/update",
          {
            params: {
              path: {
                draftId: newPost.id,
              },
            },
            body: {
              title: data.title,
              content: data.content,
              metaTitle: data.metaTitle,
              coverImage: data.coverImage,
              metaDescription: data.metaDescription,
              canonicalUri: data.canonicalUrl,
              collect: {
                collectPrice: {
                  type: "free",
                  price: 0,
                },
                collectLimit: {
                  type: "open",
                  limit: 100,
                },
              },
            },
          },
        );
      console.log("updatePost", updatePost);
      if (updatePostError) {
        toast.error(updatePostError.message);
        return;
      }

      window.open(
        Routes.editPost(
          { postId: updatePost.id },
          {
            search: {
              forceSave: "true",
            },
          },
        ),
        "_blank",
      );
    } catch (error) {
      console.error(error);
      toast.error(error as string);
    } finally {
      setLoadingPostId(null);
    }
  };

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["migration", username.value],
    queryFn: fetchPosts,
    enabled: !!username.ready,
  });

  return (
    <div className="py-10">
      <h2 className="text-2xl font-bold">Migration</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        One click migration for your old posts
      </p>

      {!username.ready ? (
        <div className="mt-5">
          <Input
            type="text"
            placeholder="Enter your username (.btc, .id.stx etc...)"
            value={username.value}
            onChange={(e) =>
              setUsername({
                value: e.target.value,
                ready: false,
              })
            }
          />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setUsername({ value: username.value, ready: true })}
          >
            Get posts
          </Button>
        </div>
      ) : null}

      {username.ready ? (
        <div className="mt-5">
          {isLoading ? <Spinner /> : null}
          {error ? <p className="text-destructive">{error.message}</p> : null}
          {posts?.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No posts found</p>
          ) : null}
          {posts?.map((post) => (
            <div key={post.id}>
              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-xl font-medium" title={post.id}>
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {format(post.createdAt, "MMM dd yyyy")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleMigrate(post.id)}
                  disabled={loadingPostId === post.id}
                >
                  Migrate
                </Button>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
