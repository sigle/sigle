import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdSettings } from 'react-icons/md';
import { Container, Button, Link } from '../../../components';
import { RadiksPrivateStory, RadiksPublicStory } from 'client/types';

const FixedContainer = styled.div`
  ${tw`fixed w-full bg-white`};
`;

const HeaderContainer = styled.div`
  ${tw`py-3 flex items-center`};
`;

const HeaderLogo = styled.img`
  height: 30px;
`;

const HeaderStatus = styled.div`
  ${tw`text-grey-darker lg:text-sm ml-6`};
`;

const HeaderSeparator = styled.img`
  ${tw`mx-auto`};
`;

const OptionIcon = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer ml-2 text-grey-darker`};
`;

interface Props {
  story?: RadiksPrivateStory | RadiksPublicStory;
  state: any;
  onOpenOptions: () => void;
  onPublishStory: () => void;
}

export const SigleEditorHeader = ({
  story,
  state,
  onOpenOptions,
  onPublishStory,
}: Props) => {
  return (
    <FixedContainer>
      <Container>
        <HeaderContainer>
          <Link href="/">
            <HeaderLogo src="/static/images/logo.png" alt="Sigle logo" />
          </Link>

          {state.status === 'fetching' && (
            <HeaderStatus>Saving ...</HeaderStatus>
          )}
          {state.status === 'success' && <HeaderStatus>Saved</HeaderStatus>}

          <HeaderSeparator />

          {story && story.attrs.radiksType === 'PrivateStory' && (
            <Button color="primary" onClick={onPublishStory}>
              Publish now
            </Button>
          )}
          {story && story.attrs.radiksType === 'PublicStory' && (
            <HeaderStatus>Published</HeaderStatus>
          )}

          {story && (
            <OptionIcon onClick={onOpenOptions}>
              <MdSettings size={20} />
            </OptionIcon>
          )}
        </HeaderContainer>
      </Container>
    </FixedContainer>
  );
};
