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
}

const plugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.decorate(
    'authenticate',
    async (req: FastifyRequest, res: FastifyReply) => {
      const token = await getToken({
        req: req as any,
        secret: config.NEXTAUTH_SECRET,
      });
      if (!token) {
        res.status(401).send('Unauthorized');
        return;
      }
      if (token) {
        // Signed in
        console.log('JSON Web Token', JSON.stringify(token, null, 2));
      }
    }
  );
};

export const fastifyAuthPlugin = FastifyPlugin(plugin, {
  fastify: '3.x',
  name: '@sigle/fastify-auth',
});
