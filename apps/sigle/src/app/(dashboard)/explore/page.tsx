import { ExplorePostsList } from "@/components/Explore/Posts/List";

export const dynamic = "force-dynamic";

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-base font-bold">Explore</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Discover the latest posts
      </p>

      <ExplorePostsList />
    </div>
  );
}
