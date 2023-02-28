## Ceramic

Run server: `composedb graphql:server --ceramic-url=http://localhost:7007 --graphiql ceramic/runtime-composite.json --did-private-key=XXX --port=5005`

1. `composedb composite:create ceramic/schema.graphql --output ceramic/composite.json --did-private-key XXX`
2. `composedb composite:compile ceramic/composite.json ceramic/runtime-composite.json`
3. `composedb composite:deploy ceramic/composite.json --ceramic-url=http://localhost:7007 --did-private-key XXX`
4. `pnpm dlx get-graphql-schema http://localhost:5005/graphql > ceramic/runtime-schema.graphql`

## Prisma

1. `pnpm prisma db pull`
2. Edit `prisma/schema.prisma` to map the models to the composite schema
3. `pnpm prisma generate`
