import { ExplorePostsList } from "@/components/Explore/Posts/List";
import { Container, Heading, Text } from "@radix-ui/themes";

export const dynamic = "force-dynamic";

export default function ExplorePage() {
  return (
    <Container size="4" className="px-4 py-10">
      <Heading as="h1" size="5">
        Explore
      </Heading>
      <Text as="p" color="gray" size="2" className="mt-2">
        Discover the latest posts
      </Text>

      <ExplorePostsList />
    </Container>
  );
}
