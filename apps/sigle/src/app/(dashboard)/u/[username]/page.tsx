import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Routes } from "@/lib/routes";
import { sigleApiFetchClient } from "@/lib/sigle";
import { UserClientPage } from "./page-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<typeof Routes.userProfile.params>;
}

// Shared by the metadata and the page, so the API is called once per request.
const getUser = cache((username: string) =>
  sigleApiFetchClient.GET("/api/users/{address}", {
    params: { path: { address: username } },
  }),
);

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const { data: user } = await getUser(params.username);

  if (!user) {
    notFound();
  }

  const title = user.profile?.displayName || user.address;

  const description = user.profile?.description
    ? user.profile.description
    : `Read ${title} publications on Sigle.`;

  return {
    title: `${title} | Sigle Profile`,
    description,
    robots: {
      follow: false,
    },
  };
}

export default async function Home({ params }: Props) {
  // The client query throws on an unknown or invalid address, so check it here to show the 404 page.
  const { response } = await getUser((await params).username);

  if (response.status === 400 || response.status === 404) {
    notFound();
  }

  return <UserClientPage params={params} />;
}
