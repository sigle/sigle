import type { Routes } from "@/lib/routes";
import { sigleApiFetchClient } from "@/lib/sigle";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserClientPage } from "./page-client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<typeof Routes.userProfile.params>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const { data: user } = await sigleApiFetchClient.GET(
    "/api/users/{username}",
    {
      params: {
        path: {
          username: params.username,
        },
      },
    },
  );
  if (!user) {
    notFound();
  }

  const title = user.id;
  const description = user.profile?.description
    ? user.profile.description
    : `Read ${title} publications on Sigle.`;

  return {
    title: `${title} | Sigle Profile`,
    description,
  };
}

export default function Home({ params }: Props) {
  return <UserClientPage params={params} />;
}
