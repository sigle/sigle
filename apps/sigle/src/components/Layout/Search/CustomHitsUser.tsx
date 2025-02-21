import { CommandItem } from "@/components/ui";
import { Routes } from "@/lib/routes";
import { Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Highlight } from "react-instantsearch";

export function CustomHitsUser({ hit }: { hit: any }) {
  const router = useRouter();

  const onHitSelect = useCallback(async () => {
    router.push(Routes.userProfile({ username: hit.id }));
  }, [router, hit.id]);

  // TODO show avatar
  // TODO customHitsPost

  return (
    <CommandItem onSelect={onHitSelect}>
      <div>
        {hit.displayName ? (
          <Text as="p" className="line-clamp-1" size="2" weight="medium">
            <Highlight
              attribute="displayName"
              hit={hit}
              highlightedTagName="strong"
            />
          </Text>
        ) : null}
        <Text as="p" className="line-clamp-1" size="1" color="gray">
          {hit.id}
        </Text>
      </div>
    </CommandItem>
  );
}
