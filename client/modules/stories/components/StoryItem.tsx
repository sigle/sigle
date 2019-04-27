import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdSettings, MdRemoveRedEye } from 'react-icons/md';
import { format } from 'date-fns';
import Tippy from '@tippy.js/react';
import { Button, Link, Dropdown, DropdownItem } from '../../../components';
import { config } from '../../../config';

const StoryItemContainer = styled.div`
  ${tw`py-4 border-b border-solid border-grey`};

  .top-container {
    ${tw`flex justify-between items-center mb-4`};
  }

  .right {
    ${tw`flex items-center`};
  }

  .title-container {
    ${tw`flex items-center`};
  }

  .title {
    ${tw`text-xl font-bold mr-2`};
  }

  .icon-container {
    ${tw`text-grey-dark`};
  }

  .edit {
    ${tw`mr-2`};
  }
`;

const SettingsContainer = styled.div`
  ${tw`relative cursor-pointer`};
`;

const SettingsDelete = styled.a`
  ${tw`text-primary`};

  &:hover {
    background-color: ${config.colors.primary} !important;
  }
`;

const StoryItemDate = styled.div`
  ${tw`text-grey-darker text-sm`};
`;

const StoryItemText = styled.div`
  ${tw`text-grey-darker text-sm truncate`};
`;

interface Props {
  story: any;
  onDelete: (id: string) => void;
}

export const StoryItem = ({ story, onDelete }: Props) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <StoryItemContainer>
      <div className="top-container">
        <div className="left">
          <div className="title-container">
            <Link className="title" href={`me/stories/${story.attrs._id}`}>
              {story.attrs.title}
            </Link>
            <Tippy
              content={'You need to publish your article to view it'}
              arrow={true}
              arrowType="round"
              theme="light-border"
            >
              <div className="icon-container">
                <MdRemoveRedEye size={22} />
              </div>
            </Tippy>
          </div>

          <StoryItemDate>
            {format(story.attrs.createdAt, 'HH:mm DD MMMM YYYY')}
          </StoryItemDate>
        </div>
        <div className="right">
          {/*
        // @ts-ignore */}
          <Button
            color="primary"
            className="edit"
            as={Link}
            href={`me/stories/${story.attrs._id}`}
          >
            Edit
          </Button>
          <SettingsContainer onClick={() => setMenuOpen(!menuOpen)}>
            <MdSettings size={24} />
            <Dropdown open={menuOpen} onClose={() => setMenuOpen(false)}>
              <DropdownItem>
                <Link href="/me">Publish</Link>
              </DropdownItem>
              <DropdownItem>
                <SettingsDelete onClick={() => onDelete(story.attrs._id)}>
                  Delete
                </SettingsDelete>
              </DropdownItem>
            </Dropdown>
          </SettingsContainer>
        </div>
      </div>
      <StoryItemText>
        TODO Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis
        accumsan arcu. Sed diam tellus, sollicitudin quis leo consequat,
        efficitur mattis ex. Sed sit amet volutpat ipsum, ut consequat mauris.
      </StoryItemText>
    </StoryItemContainer>
  );
};
