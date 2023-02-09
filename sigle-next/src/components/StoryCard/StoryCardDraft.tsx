import Link from 'next/link';
import { useRouter } from 'next/router';
import { TbDots } from 'react-icons/tb';
import { graphql, useFragment } from 'react-relay';
import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  IconButton,
  Typography,
} from '@sigle/ui';
import { StoryCardDraft_post$key } from '@/__generated__/relay/StoryCardDraft_post.graphql';

interface StoryCardDraftProps {
  story: StoryCardDraft_post$key;
}

export const StoryCardDraft = ({ story: storyProp }: StoryCardDraftProps) => {
  const router = useRouter();

  const storyData = useFragment(
    graphql`
      fragment StoryCardDraft_post on Post {
        id
        title
      }
    `,
    storyProp
  );

  const storyEditorLink = `/editor/${storyData.id}`;

  return (
    <Flex
      direction="column"
      css={{
        borderTop: '1px solid $gray6',
        py: '$6',
        '&:first-child': {
          borderTop: 'none',
        },
      }}
    >
      <Link href={storyEditorLink}>
        <Typography size="lg" fontWeight="bold" lineClamp={2}>
          {storyData.title}
        </Typography>
      </Link>
      <Link href={storyEditorLink}>
        <Typography size="sm" color="gray9" css={{ mt: '$2' }} lineClamp={3}>
          Blockchain has completely changed the way we think about money and
          created a true era of digital property. Bitcoin is the first
          successful use case for blockchain. Some creative developers believe
          Bitcoin is the first successful use case for blockchain. Some creative
          developers believe Bitcoin is the first successful use case for
          blockchain.
        </Typography>
      </Link>
      <Flex justify="between" align="center" css={{ mt: '$9' }}>
        <Typography size="xs" color="gray9">
          Feb 18, 2023 at 11:46am
        </Typography>
        <Flex align="center" gap="2">
          <Badge>DRAFT</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton size="xs" variant="ghost">
                <TbDots />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => router.push(storyEditorLink)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => alert('TODO')}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </Flex>
    </Flex>
  );
};
