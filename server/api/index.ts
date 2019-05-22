import express from 'express';

export const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
  // TODO
  res.json(true);
});
