import Link from 'next/link';
import { useRouter } from 'next/router';
import { TbDots } from 'react-icons/tb';
import { format } from 'date-fns';
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
import { styled } from '@sigle/stitches.config';
import { CeramicPost } from '@/types/ceramic';

const StyledDropdownMenuItem = styled(DropdownMenuItem, {
  color: '$orange11',
});

const StyledDropdownMenuContent = styled(DropdownMenuContent, {
  minWidth: 100,
});

interface StoryCardDraftProps {
  post: CeramicPost;
}

export const StoryCardDraft = ({ post }: StoryCardDraftProps) => {
  const router = useRouter();

  const postEditorLink = `/editor/${post.id}`;

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
      <Link href={postEditorLink}>
        <Typography size="lg" fontWeight="bold" lineClamp={2}>
          {post.title}
        </Typography>
      </Link>
      <Link href={postEditorLink}>
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
          {format(new Date(post.createdAt), "MMM dd, yyyy 'at' h:mmaaa")}
        </Typography>
        <Flex align="center" gap="2">
          <Badge>DRAFT</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton size="xs" variant="ghost">
                <TbDots />
              </IconButton>
            </DropdownMenuTrigger>
            <StyledDropdownMenuContent side="left" align="end">
              <DropdownMenuItem onSelect={() => router.push(postEditorLink)}>
                Edit
              </DropdownMenuItem>
              <StyledDropdownMenuItem onSelect={() => alert('TODO')}>
                Delete
              </StyledDropdownMenuItem>
            </StyledDropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </Flex>
    </Flex>
  );
};
