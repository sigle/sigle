import { Container, Heading } from "@radix-ui/themes";
import { ExplorePostsList } from "@/components/Explore/Posts/List";

export const dynamic = "force-dynamic";

export default function ExplorePage() {
  return (
    <Container size="4" className="px-4 py-10">
      <Heading as="h1" size="5">
        Explore
      </Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        Discover the latest posts
      </p>

      <ExplorePostsList />
    </Container>
  );
}
