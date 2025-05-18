"use client";

import { useSession } from "@/lib/auth-hooks";
import { Heading } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function MigrationPage() {
  const { data: session } = useSession();
  // TODO input for username
  const [username, setUsername] = useState<string>("sigle.btc");

  const fetchPosts = async () => {
    const res = await fetch(`/api/migration/list?username=${username}`);
    const data = await res.json();
    return data;
  };

  const { data } = useQuery({
    queryKey: ["migration"],
    queryFn: fetchPosts,
  });

  if (!session) {
    return null;
  }

  console.log(data);

  return (
    <div className="space-y-8 py-10">
      <Heading>Migration</Heading>
    </div>
  );
}
