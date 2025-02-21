import { Routes } from "@/lib/routes";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
// import "instantsearch.css/themes/satellite.css";
import { Text, TextField } from "@radix-ui/themes";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  Configure,
  Highlight,
  Hits,
  Index,
  InstantSearch,
  SearchBox,
  UseSearchBoxProps,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui";

const Hit = ({ hit }) => (
  <article key={hit.id}>
    <h1>{hit.displayName}</h1>
    <p>{hit.id}</p>
  </article>
);

const HitPost = ({ hit }) => (
  <article key={hit.id}>
    <h1>{hit.title}</h1>
    <p>{hit.id}</p>
  </article>
);

const { searchClient } = instantMeiliSearch(
  "http://localhost:7700/",
  // TODO see for read only key
  "1JmkmCKvLxP0XkyJNoRttzbC62oDWCh4V4CTypSN8kY",
);

function CustomSearchBox(props: UseSearchBoxProps) {
  const { query, refine } = useSearchBox(props);
  const { status } = useInstantSearch();
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  function setQuery(newQuery: string) {
    setInputValue(newQuery);

    refine(newQuery);
  }

  return (
    <div>
      <form
        action=""
        role="search"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (inputRef.current) {
            inputRef.current.blur();
          }
        }}
        onReset={(event) => {
          event.preventDefault();
          event.stopPropagation();

          setQuery("");

          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <TextField.Root
          placeholder="Search"
          variant="surface"
          color="gray"
          ref={inputRef}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={512}
          type="search"
          value={inputValue}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
          }}
        >
          <TextField.Slot>
            <IconSearch height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </form>
    </div>
  );
}

export const Search = () => {
  return (
    <CommandDialog open={true}>
      <InstantSearch indexName="users" searchClient={searchClient as any}>
        {/* <CustomSearchBox /> */}
        <SearchBox />
        <CommandList className="min-h-[300px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <Index indexName="users">
            <CommandGroup heading="Users">
              <Configure hitsPerPage={5} />
              <Hits hitComponent={(props) => <CustomHitsUser {...props} />} />
            </CommandGroup>
          </Index>
          <Index indexName="posts">
            <CommandGroup heading="Posts">
              <Configure hitsPerPage={5} />
              <Hits hitComponent={(props) => <CustomHitsUser {...props} />} />
            </CommandGroup>
          </Index>
        </CommandList>
      </InstantSearch>
    </CommandDialog>
  );
};

function CustomHitsUser({ hit }: { hit: Hit<BaseHit> }): JSX.Element {
  const router = useRouter();

  const onHitSelect = useCallback(async () => {
    router.push(Routes.userProfile({ username: hit.id }));
  }, [router, hit.id]);

  // TODO show avatar

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
        <Text as="p" className="mt-1 line-clamp-1" size="1" color="gray">
          {hit.id}
        </Text>
      </div>
    </CommandItem>
  );
}
