# Sigle server

## Authentication

To protect a route, use the `authenticate` middleware like this. If the user is not authenticated it will throw a 401 error. If the user is authenticated you can access the `address` information.

```ts
fastify.get(
  '/protected-route',
  {
    onRequest: [fastify.authenticate],
  },
  async function (request, reply) {
    console.log(request.address);
  }
);
```
