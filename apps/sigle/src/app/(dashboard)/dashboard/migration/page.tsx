"use client";

import { Heading, Spinner, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function MigrationPage() {
  // TODO input for username
  const [username, setUsername] = useState<string>("sigle.btc");

  const fetchPosts = async (): Promise<{ id: string; title: string }[]> => {
    const res = await fetch(`/api/migration/list?username=${username}`);
    const data = await res.json();
    return data;
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ["migration"],
    queryFn: fetchPosts,
  });

  return (
    <div className="py-10">
      <Heading>Migration</Heading>
      <Text as="p" color="gray" size="2" className="mt-2">
        List of posts that you can migrate for {username}
      </Text>

      <div className="mt-5">
        {isLoading ? <Spinner /> : null}
        {posts?.map((post) => (
          <div key={post.id} className="mt-4">
            <Heading size="2" title={post.id}>
              {post.title}
            </Heading>
          </div>
        ))}
      </div>
    </div>
  );
}
