import { addressAvatar } from '@/utils';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { styled } from '@sigle/stitches.config';
import { Badge, Button, Flex, Typography } from '@sigle/ui';
import Image from 'next/image';
import Link from 'next/link';
import { TbBrandTwitter, TbLink } from 'react-icons/tb';

const AvatarContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  overflow: 'hidden',
  width: 72,
  height: 72,
  br: '$sm',
});

export const UserProfile = () => {
  return (
    <>
      <Flex justify="between">
        <AvatarContainer>
          <Image
            loader={nextImageLoader}
            src={addressAvatar('TODO', 72)}
            alt="Picture of the author"
            width={72}
            height={72}
          />
        </AvatarContainer>
        <Link href="/settings">
          <Button variant="light" size="sm">
            Edit profile
          </Button>
        </Link>
      </Flex>

      <Flex mt="2" gap="3" align="center">
        <Typography size="lg" fontWeight="semiBold">
          Motoki Tonn
        </Typography>
        <Badge>motoki.btc</Badge>
      </Flex>

      <Flex mt="3" gap="3">
        <Typography size="sm">
          106{' '}
          <Typography as="span" size="sm" color="gray9">
            Following
          </Typography>
        </Typography>
        <Typography size="sm">
          3,209{' '}
          <Typography as="span" size="sm" color="gray9">
            Followers
          </Typography>
        </Typography>
      </Flex>

      <Flex mt="3">
        <Typography size="sm" color="gray9">
          Writer and novelist. Bestselling author of “AI will change the world”.
          Lover of coffee, books, and the written word. Always on the lookout
          for new stories to tell. Can't stop the feeling that time is going
          faster.
        </Typography>
      </Flex>

      <Flex mt="5" gap="3" align="center">
        <Link href="https://www.sigle.io" target="_blank">
          <Flex align="center" gap="1">
            <Typography size="sm" color="gray9">
              <TbLink size={16} />
            </Typography>
            <Typography size="sm" color="indigo">
              www.sigle.io
            </Typography>
          </Flex>
        </Link>
        <Link href="https://www.sigle.io" target="_blank">
          <Typography size="sm">
            <TbBrandTwitter fill="currentColor" stroke="0" size={16} />
          </Typography>
        </Link>
      </Flex>
    </>
  );
};
