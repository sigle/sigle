"use client";

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

export default function MigrationPage() {
  const [username, setUsername] = useState<{ value: string; ready: boolean }>({
    value: "",
    ready: false,
  });

  const fetchPosts = async (): Promise<
    { id: string; title: string; createdAt: number }[]
  > => {
    const res = await fetch(`/api/migration/list?username=${username.value}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
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
              <Button color="gray" variant="outline" highContrast>
                Migrate
              </Button>
            </div>
            <Separator size="4" />
          </div>
        ))}
      </div>
    </div>
  );
}
