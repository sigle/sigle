import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import {
  InstantSearch,
  UseSearchBoxProps,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch";
import "instantsearch.css/themes/satellite.css";
import { TextField } from "@radix-ui/themes";
import { IconSearch } from "@tabler/icons-react";
import { useRef, useState } from "react";

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

  const isSearchStalled = status === "stalled";

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
    <InstantSearch indexName="users" searchClient={searchClient as any}>
      <CustomSearchBox />

      {/* <Index indexName="users">
        <h2>
          index: <code>instant_search</code>
        </h2>
        <Configure hitsPerPage={16} />
        <Hits hitComponent={Hit} />
      </Index>
      <Index indexName="posts">
        <h2>
          index: <code>posts</code>
        </h2>
        <Configure hitsPerPage={16} />
        <Hits hitComponent={HitPost} />
      </Index> */}
    </InstantSearch>
  );
};
