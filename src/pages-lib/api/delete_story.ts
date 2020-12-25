import { NextApiHandler } from 'next';
import { prismaClient } from '../../utils/prisma';

// TODO see how we can apply some validation, eg: only owner can call this endpoint
/**
 * Delete the entry from the indexer.
 */
export const deleteStory: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 400;
    res.json({ success: false });
    return;
  }

  const username = req.body.username as string;
  const storyId = req.body.storyId as string;

  if (!username || !storyId) {
    res.statusCode = 400;
    res.json({ success: false });
    return;
  }

  // TODO change to .delete single once index is implemented on storyId and username
  await prismaClient.story.deleteMany({
    where: { storyId, username },
  });

  res.json({ success: true });
};
