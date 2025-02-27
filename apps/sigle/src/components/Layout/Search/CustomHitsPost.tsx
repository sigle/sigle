import { CommandItem } from "@/components/ui";
import { Routes } from "@/lib/routes";
import { Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Highlight } from "react-instantsearch";

export function CustomHitsPost({ hit }: { hit: any }) {
  const router = useRouter();

  const onHitSelect = useCallback(() => {
    router.push(Routes.post({ postId: hit.id }));
  }, [router, hit.id]);

  return (
    <CommandItem onSelect={onHitSelect}>
      <div>
        <Text as="p" className="line-clamp-1" size="2" weight="medium">
          <Highlight attribute="title" hit={hit} highlightedTagName="strong" />
        </Text>
        <Text as="p" className="line-clamp-1" size="1" color="gray">
          {hit.excerpt}
        </Text>
      </div>
    </CommandItem>
  );
}
