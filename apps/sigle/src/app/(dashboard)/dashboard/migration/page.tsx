"use client";

import { Routes } from "@/lib/routes";
import { sigleApiFetchClient } from "@/lib/sigle";
import {
  Button,
  Heading,
  Separator,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

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
  // biome-ignore lint/suspicious/noExplicitAny: content is not typed
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

  const fetchPosts = async (): Promise<SubsetStory[]> => {
    const res = await fetch(`/api/migration/list?username=${username.value}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
    return data;
  };

  const handleMigrate = async (id: string) => {
    // 1. Fetch the post from old API
    const res = await fetch(`/api/migration/${id}?username=${username.value}`);
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
      await sigleApiFetchClient.POST("/api/protected/drafts/{draftId}/update", {
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
      });
    console.log("updatePost", updatePost);
    if (updatePostError) {
      toast.error(updatePostError.message);
      return;
    }

    window.open(Routes.editPost({ postId: updatePost.id }), "_blank");
    return data;
  };

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["migration"],
    queryFn: fetchPosts,
    enabled: !!username.ready,
  });

  return (
    <div className="py-10">
      <Heading>Migration</Heading>
      <Text as="p" color="gray" size="2" className="mt-2">
        One click migration for your old posts
      </Text>

      {!username.ready ? (
        <div className="mt-5">
          <TextField.Root
            type="text"
            size="2"
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
            color="gray"
            variant="outline"
            highContrast
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
          {error ? <Text color="red">{error.message}</Text> : null}
          {posts?.length === 0 ? (
            <Text color="gray" size="2" className="mt-2">
              No posts found
            </Text>
          ) : null}
          {posts?.map((post) => (
            <div key={post.id}>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <Heading size="2" weight="medium" title={post.id}>
                    {post.title}
                  </Heading>
                  <Text as="p" color="gray" size="2" className="mt-2">
                    {format(post.createdAt, "MMM dd yyy")}
                  </Text>
                </div>
                <Button
                  color="gray"
                  variant="outline"
                  highContrast
                  onClick={() => handleMigrate(post.id)}
                >
                  Migrate
                </Button>
              </div>
              <Separator size="4" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
