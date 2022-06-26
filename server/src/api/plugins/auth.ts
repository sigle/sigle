import {
  FastifyPluginAsync,
  FastifyRequest,
  FastifyReply,
  onRequestHookHandler,
} from 'fastify';
import FastifyPlugin from 'fastify-plugin';
import { getToken } from 'next-auth/jwt';
import { config } from '../../config';

/**
 * Extend the fastify types so modules can use the .authenticate method.
 */
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: onRequestHookHandler;
  }

  interface FastifyRequest {
    address: string;
  }
}

const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    'authenticate',
    async (req: FastifyRequest, res: FastifyReply) => {
      /**
       * Allow tests to bypass the authentication.
       */
      if (
        config.NODE_ENV === 'test' &&
        req.cookies['next-auth.session-token']
      ) {
        req.address = req.cookies['next-auth.session-token'];
        return;
      }

      const token = await getToken({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: req as any,
        secret: config.NEXTAUTH_SECRET,
      });
      if (!token || !token.sub) {
        res.status(401).send('Unauthorized');
        return;
      }

      // Inject the user address so it can be used in subsequent requests.
      req.address = token.sub;
    }
  );
};

export const fastifyAuthPlugin = FastifyPlugin(plugin, {
  fastify: '4.x',
  name: '@sigle/fastify-auth',
});
