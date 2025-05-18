"use client";

import { Button, Heading, Separator, Spinner, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function MigrationPage() {
  // TODO input for username
  const [username, setUsername] = useState<string>("sigle.btc");

  const fetchPosts = async (): Promise<
    { id: string; title: string; createdAt: number }[]
  > => {
    const res = await fetch(`/api/migration/list?username=${username}`);
    const data = await res.json();
    return data;
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ["migration"],
    queryFn: fetchPosts,
  });

  console.log(posts);

  return (
    <div className="py-10">
      <Heading>Migration</Heading>
      <Text as="p" color="gray" size="2" className="mt-2">
        One click migration for your old posts
      </Text>

      <div className="mt-5">
        {isLoading ? <Spinner /> : null}
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
