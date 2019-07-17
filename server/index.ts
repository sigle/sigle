import dotenv from 'dotenv';

dotenv.config();

import { init } from '@sentry/browser';
import { join } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import next from 'next';
import { setup } from 'radiks-server';
import graphqlHTTP from 'express-graphql';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import { config } from './config';
import { schema } from './graphql/schema';

if (process.env.NODE_ENV === 'production' && config.sentryDsn) {
  init({
    dsn: config.sentryDsn,
    environment: process.env.NODE_ENV,
  });
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  // First connect to mongo
  const mongoClient = new MongoClient(config.mongoDBUrl, {
    useNewUrlParser: true,
  });
  await mongoClient.connect();
  const db = mongoClient.db();
  await mongoose.connect(config.mongoDBUrl, {
    useNewUrlParser: true,
  });

  const expressApp = express();

  expressApp.use(helmet());
  expressApp.use(bodyParser.urlencoded({ extended: true }));
  expressApp.use(bodyParser.json());

  const RadiksController = await setup({
    mongoDBUrl: config.mongoDBUrl,
  });
  expressApp.use('/radiks', RadiksController);

  // Link the graphql server
  expressApp.use(
    '/graphql',
    graphqlHTTP({
      schema,
      graphiql: process.env.NODE_ENV !== 'production',
      context: { db },
    })
  );

  expressApp.get('/manifest.json', (_, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    const manifestPath = dev
      ? join(__dirname, '..', 'static', 'manifest.json')
      : // In production the static folder is one level lower
        join(__dirname, '..', '..', 'static', 'manifest.json');
    res.sendFile(manifestPath);
  });

  expressApp.get('/me/stories/:id', (req, res) => {
    return nextApp.render(req, res, '/editor', { storyId: req.params.id });
  });

  expressApp.get('/me/stories/drafts/:id', (req, res) => {
    return nextApp.render(req, res, '/editor', {
      storyId: req.params.id,
      storyType: 'private',
    });
  });

  expressApp.get('/me/settings', (req, res) => {
    return nextApp.render(req, res, '/settings');
  });

  expressApp.get('/me/stats', (req, res) => {
    return nextApp.render(req, res, '/stats');
  });

  expressApp.get('/@:username', (req, res) => {
    const { username } = req.params;
    return nextApp.render(req, res, '/profile', { username });
  });

  expressApp.get('/@:username/:storyId', (req, res) => {
    const { username, storyId } = req.params;
    return nextApp.render(req, res, '/story', { username, storyId });
  });

  expressApp.get('*', (req, res) => {
    return handle(req, res);
  });

  expressApp.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
