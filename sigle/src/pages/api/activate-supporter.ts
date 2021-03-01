import { NextApiHandler } from 'next';

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
  // TODO prisma query to find the unused code
  // TODO prisma record to create a new user

  res.status(200).json({ success: true });
};

export default activateSupporterAccount;
