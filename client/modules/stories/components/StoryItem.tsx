import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdSettings, MdRemoveRedEye } from 'react-icons/md';
import { format } from 'date-fns';
import { Button, Link } from '../../../components';

const StoryItemContainer = styled.div`
  ${tw`py-4 border-b border-solid border-grey`};

  .top-container {
    ${tw`flex justify-between items-center mb-4`};
  }

  .right {
    ${tw`flex items-center`};
  }

  .title {
    ${tw`text-xl font-bold flex items-center`};
  }

  .icon {
    ${tw`ml-2`};
  }

  .date {
    ${tw`text-grey-darker text-sm`};
  }

  .edit {
    ${tw`mr-2`};
  }

  .text {
    ${tw`text-grey-darker text-sm truncate`};
  }
`;

interface Props {
  story: any;
}

export const StoryItem = ({ story }: Props) => (
  <StoryItemContainer>
    <div className="top-container">
      <div className="left">
        <div className="title">
          {story.attrs.title} <MdRemoveRedEye size={22} className="icon" />
        </div>
        <div className="date">
          {format(story.attrs.createdAt, 'HH:mm DD MMMM YYYY')}
        </div>
      </div>
      <div className="right">
        <Button
          color="primary"
          className="edit"
          as={Link}
          href={`me/stories/${story.attrs._id}`}
        >
          Edit
        </Button>
        <MdSettings size={24} />
      </div>
    </div>
    <div className="text">
      TODO Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis
      accumsan arcu. Sed diam tellus, sollicitudin quis leo consequat, efficitur
      mattis ex. Sed sit amet volutpat ipsum, ut consequat mauris.
    </div>
  </StoryItemContainer>
);
