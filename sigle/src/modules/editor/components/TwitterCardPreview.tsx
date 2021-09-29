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

export const TwitterCardPreview = () => {
  return (
    <>
      <MetaContainer>
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
    </>
  );
};
