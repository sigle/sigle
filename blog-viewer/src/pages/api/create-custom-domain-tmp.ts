import { NextApiHandler } from 'next';
import { prismaClient } from '../../utils/prisma';

// TODO to replace with a better solution
const createCustomDomain: NextApiHandler = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (!req.body.username) {
    res.status(400).end(false);
    return;
  }

  if (!req.body.domain) {
    res.status(400).end(false);
    return;
  }

  if (req.body.secret !== process.env.TMP_API_SECRET) {
    res.status(400).end(false);
    return;
  }

  console.log('Creating new user', {
    username: req.body.username,
    domain: req.body.domain,
  });

  await prismaClient.user.create({
    data: {
      username: req.body.username,
      domain: req.body.domain,
    },
  });

  res.status(200).send(true);
};

export default createCustomDomain;
