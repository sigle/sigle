import { NextApiHandler } from 'next';

/**
 * Health check endpoint, used to check that the server is running properly
 */
const healthCheckEndpoint: NextApiHandler = async (_, res) => {
  res.status(200).send(true);
};

export default healthCheckEndpoint;
