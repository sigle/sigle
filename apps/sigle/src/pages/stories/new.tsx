import React from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import * as Fathom from 'fathom-client';
import { useAsyncEffect } from 'use-async-effect';
import Image from 'next/image';
import { Text } from '@radix-ui/themes';
import { Goals } from '@/utils/fathom';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '@/utils';
import { createSubsetStory } from '@/modules/editor/utils';
import { Protected } from '../../modules/auth/Protected';

const CreateStory = () => {
  const router = useRouter();

  /**
   * Create a new story and redirect to the editor page once it's done
   */
  useAsyncEffect(async (isMounted) => {
    try {
      const storiesFile = await getStoriesFile();
      const story = createNewEmptyStory();

      storiesFile.stories.unshift(
        createSubsetStory(story, { plainContent: '' }),
      );

      await saveStoriesFile(storiesFile);
      await saveStoryFile(story);

      Fathom.trackGoal(Goals.CREATE_NEW_STORY, 0);
      if (isMounted()) {
        router.push('/stories/[storyId]', `/stories/${story.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Image
        width={250}
        height={94}
        src="/static/img/zero_data.gif"
        alt="Creating story"
      />
      <Text size="3" weight="medium">
        Creating story ...
      </Text>
    </div>
  );
};

const EditorNewPage = () => {
  return (
    <Protected>
      <CreateStory />
    </Protected>
  );
};

export default EditorNewPage;
