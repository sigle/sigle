"use client";

import { useSession } from "@/lib/auth-hooks";
import { Heading } from "@radix-ui/themes";
import { useEffect, useState } from "react";

export default function MigrationPage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState<string>("sigle.btc");

  const fetchPosts = async () => {
    const res = await fetch(
      `https://api.sigle.io/api/gaia/${username}/stories`,
    );
    const data = await res.json();
    console.log(data);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-8 py-10">
      <Heading>Migration</Heading>
    </div>
  );
}
