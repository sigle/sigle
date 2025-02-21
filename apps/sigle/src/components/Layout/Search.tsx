import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { Dialog, TextField, VisuallyHidden } from "@radix-ui/themes";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <TextField.Root
        placeholder="Search"
        variant="soft"
        color="gray"
        size="2"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <TextField.Slot>
          <IconSearch height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <Dialog.Title>Search</Dialog.Title>
          <Dialog.Description>Search for users and posts</Dialog.Description>
        </VisuallyHidden>
        <InstantSearch
          indexName="users"
          searchClient={searchClient as any}
          future={{ preserveSharedStateOnUnmount: true }}
        >
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
    </>
  );
};
