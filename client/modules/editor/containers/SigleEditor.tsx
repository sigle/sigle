import React, { useState, useEffect, useReducer, useRef } from 'react';
import { toast } from 'react-toastify';
import { PrivateStory } from '../../../models';
import { SigleEditor as Component } from '../components/SigleEditor';

interface Props {
  storyId: string;
}

type Action = { type: 'fetching' } | { type: 'success' } | { type: 'error' };

interface State {
  status?: 'fetching' | 'success' | 'error';
  error?: string;
}

const initialState: State = { status: undefined, error: undefined };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'fetching':
      return { ...initialState, status: 'fetching' };
    case 'success':
      return { ...state, status: 'success' };
    case 'error':
      return { ...state, status: 'error' };
    default:
      throw new Error();
  }
};

export const SigleEditor = ({ storyId }: Props) => {
  // TODO error state
  const [loading, setLoading] = useState<boolean>(true);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [story, setStory] = useState<any | undefined>();
  const [state, dispatch] = useReducer(reducer, initialState);
  const timeoutId = useRef<number | undefined>(undefined);

  const fetchStory = async () => {
    // TODO this can be either a private or a public story
    const privateStory = await PrivateStory.findById(storyId);
    setStory(privateStory);
    setLoading(false);
  };

  const handleChangeStoryField = ({
    fieldName,
    value,
  }: {
    fieldName: 'content' | 'title';
    value: any;
  }) => {
    if (!story) return;

    // We are now fetching, meaning that we will save at some point
    if (state.status !== 'fetching') {
      dispatch({ type: 'fetching' });
    }

    // For all other fields than content we set directly
    // We don't set content directly for performance reasons
    if (fieldName !== 'content') {
      story.update({ [fieldName]: value });
    }

    // We cancel the previous call to the function
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(async () => {
      try {
        if (fieldName === 'content') {
          story.update({ content: JSON.stringify(value.toJSON()) });
        }
        await story.save();
        dispatch({ type: 'success' });
      } catch (error) {
        dispatch({ type: 'error' });
        toast.error(error.message);
      }
    }, 1500);
  };

  /**
   * When we mount we fetch the story from the server
   * When we unmount we unset all the timeouts that can be pending
   */
  useEffect(() => {
    fetchStory();

    return () => {
      clearTimeout(timeoutId.current);
    };
  }, []);

  if (loading) {
    // TODO nice loading
    return <div>Loading ...</div>;
  }

  // TODO see why this never happen
  if (!story) {
    // TODO nice 404
    return <div>Story not found</div>;
  }
  return (
    <Component
      story={story}
      state={state}
      onChangeStoryField={handleChangeStoryField}
      optionsOpen={optionsOpen}
      onChangeOptionsOpen={open => setOptionsOpen(open)}
    />
  );
};
