import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import next from 'next';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();

  app.use(helmet());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.get('/a', (req, res) => {
    return nextApp.render(req, res, '/a', req.query);
  });

  app.get('/b', (req, res) => {
    return nextApp.render(req, res, '/b', req.query);
  });

  app.get('/posts/:id', (req, res) => {
    return nextApp.render(req, res, '/posts', { id: req.params.id });
  });

  app.get('*', (req, res) => {
    return handle(req, res);
  });

  app.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
