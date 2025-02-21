import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { Configure, Hits, Index, InstantSearch } from "react-instantsearch";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandSeparator,
} from "../ui";
import { CustomHitsUser } from "./Search/CustomHitsUser";
import { CustomSearchBox } from "./Search/CustomSearchBox";

const { searchClient } = instantMeiliSearch(
  "http://localhost:7700/",
  // TODO see for read only key
  "1JmkmCKvLxP0XkyJNoRttzbC62oDWCh4V4CTypSN8kY",
);

export const Search = () => {
  return (
    <CommandDialog open={true}>
      <InstantSearch indexName="users" searchClient={searchClient as any}>
        <CustomSearchBox />

        <CommandList className="min-h-[300px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <Index indexName="users">
            <CommandGroup heading="Users">
              <Configure hitsPerPage={5} />
              <Hits hitComponent={(props) => <CustomHitsUser {...props} />} />
            </CommandGroup>
          </Index>
          <CommandSeparator />
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
