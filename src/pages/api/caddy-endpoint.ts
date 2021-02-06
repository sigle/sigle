import { NextApiHandler } from 'next';

const caddyEndpoint: NextApiHandler = async (req, res) => {
  console.log(req.headers);

  // TODO validate domain against db
  res.status(200).json(true);
};

export default caddyEndpoint;
