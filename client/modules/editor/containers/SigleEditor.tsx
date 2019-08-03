import React, { useState, useEffect, useReducer, useRef } from 'react';
import { toast } from 'react-toastify';
import Router from 'next/router';
import { PrivateStory, PublicStory } from '../../../models';
import { SigleEditor as Component } from '../components/SigleEditor';

interface Props {
  storyId: string;
  storyType?: 'private';
}

type Action = { type: 'fetching' } | { type: 'success' } | { type: 'error' };

export interface State {
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

export const SigleEditor = ({ storyId, storyType }: Props) => {
  // TODO error state
  const [loading, setLoading] = useState<boolean>(true);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [story, setStory] = useState<any | undefined>();
  const [state, dispatch] = useReducer(reducer, initialState);
  const timeoutId = useRef<number | undefined>(undefined);

  const fetchStory = async () => {
    // TODO try catch
    if (storyType === 'private') {
      const privateStory = await PrivateStory.findById(storyId);
      setStory(privateStory);
    } else {
      const publicStory = await PublicStory.findById(storyId);
      setStory(publicStory);
    }
    setLoading(false);
  };

  const handlePublishStory = async () => {
    try {
      const publicStory = new PublicStory({ ...story.attrs });
      await publicStory.save();
      // TODO do not reload the page and use `href` and `as`·
      Router.push(`/me/stories/${publicStory.attrs._id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
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
        console.error(error);
        toast.error(error.message);
      }
    }, 1500);
  };
  /**
   * When we mount:
   * - we fetch the story from the server
   * When we unmount:
   * - we unset all the timeouts that can be pending
   */
  useEffect(() => {
    fetchStory();

    return () => {
      clearTimeout(timeoutId.current);
    };
  }, []);

  const handleWindowClose = (e: BeforeUnloadEvent) => {
    if (state.status === 'fetching') {
      e.preventDefault();
      return (e.returnValue =
        'You have unsaved changes - are you sure you wish to close?');
    }
  };

  /**
   * If we are on the client we show a prompt message when user
   * try to close the tab while it's not saved yet
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleWindowClose);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleWindowClose);
      }
    };
  }, [handleWindowClose]);

  return (
    <Component
      loading={loading}
      story={story}
      state={state}
      onChangeStoryField={handleChangeStoryField}
      onPublishStory={handlePublishStory}
      optionsOpen={optionsOpen}
      onChangeOptionsOpen={open => setOptionsOpen(open)}
    />
  );
};
