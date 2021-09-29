import { Link2Icon } from '@radix-ui/react-icons';
import { styled } from '../../../stitches.config';
import { Flex, Box } from '../../../ui';

const MetaContainer = styled('div', {
  borderColor: 'rgb(207, 217, 222)',
  borderRadius: '16px',
  borderWidth: '1px',
  borderStyle: 'solid',
  overflow: 'hidden',
});

const MetaTitle = styled('div', {
  color: 'rgb(15, 20, 25)',
  fontSize: '15px',
  lineHeight: '20px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const MetaDescription = styled('div', {
  color: 'rgb(83, 100, 113)',
  fontSize: '15px',
  lineHeight: '20px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const MetaLink = styled('div', {
  color: 'rgb(83, 100, 113)',
  fontSize: '15px',
  lineHeight: '20px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  alignItems: 'center',
});

// TODO take props
// TODO style without image

export const TwitterCardPreview = () => {
  return (
    <MetaContainer>
      <Box css={{ overflow: 'hidden', position: 'relative' }}>
        <Box css={{ paddingBottom: '52.356%' }} />
        <Box
          css={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <Box
            css={{
              backgroundImage:
                'url("https://pbs.twimg.com/card_img/1442525177884000258/U7x0MmsK?format=jpg&name=small")',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              height: '100%',
              width: '100%',
            }}
          />
        </Box>
      </Box>

      <Flex direction="column" css={{ gap: 2, padding: 12 }}>
        <MetaTitle>Sigle</MetaTitle>
        <MetaDescription>
          Sigle is a decentralised, open-source platform empowering creators.
          Write, share, build your audience and earn Bitcoin.
        </MetaDescription>
        <MetaLink>
          <Link2Icon />
          <Box as="span" css={{ ml: 4 }}>
            sigle.io
          </Box>
        </MetaLink>
      </Flex>
    </MetaContainer>
  );
};
