import { NextApiHandler } from 'next';

const allowedDomains = new Set([
  'test.leopradel.com',
  'sigle-blog.leopradel.com',
]);

const caddyEndpoint: NextApiHandler = async (req, res) => {
  const domain = req.query.domain as string | undefined;

  if (domain) {
    if (allowedDomains.has(domain)) {
      // TODO validate domain against db
      res.status(200).json(true);
      return;
    }
    console.log(`${domain} is not allowed`);
  }

  res.status(503).send('Invalid domain');
};

export default caddyEndpoint;
