import { NextApiHandler } from 'next';
import { prismaClient } from '../../utils/prisma';
import { initSentry } from '../../utils/sentry';

initSentry();

type ActivateSupporterAccountResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
    };

/**
 * Activate a supporter account given a code the user received
 */
const activateSupporterAccount: NextApiHandler<ActivateSupporterAccountResponse> = async (
  req,
  res
) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const code: string | undefined = req.body.code;
  if (!code) {
    res.status(200).json({ success: false, message: 'Invalid code' });
    return;
  }

  // TODO extract username from request - see how to do this
  const username = 'leopradel.id.blockstack';

  // TODO prisma query to find the unused code
  // TODO check the code is unused
  const dbCode = 'testCode';
  if (code !== dbCode) {
    res.status(200).json({ success: false, message: 'Invalid code' });
    return;
  }

  // Check that the user does not already exist
  const dbUser = await prismaClient.user.findUnique({
    where: {
      username,
    },
  });
  if (!dbUser) {
    res.status(200).json({ success: false, message: 'User already exist' });
    return;
  }

  await prismaClient.user.create({
    data: {
      username,
    },
  });

  res.status(200).json({ success: true });
};

export default activateSupporterAccount;
