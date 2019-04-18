import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdSettings, MdRemoveRedEye } from 'react-icons/md';
import { Button } from '../../../components';

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

export const StoryItem = () => (
  <StoryItemContainer>
    <div className="top-container">
      <div className="left">
        <div className="title">
          Title <MdRemoveRedEye size={24} className="icon" />
        </div>
        <div className="date">January 26, 2017</div>
      </div>
      <div className="right">
        <Button color="primary" className="edit">
          Edit
        </Button>
        <MdSettings size={24} />
      </div>
    </div>
    <div className="text">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis accumsan
      arcu. Sed diam tellus, sollicitudin quis leo consequat, efficitur mattis
      ex. Sed sit amet volutpat ipsum, ut consequat mauris.
    </div>
  </StoryItemContainer>
);
