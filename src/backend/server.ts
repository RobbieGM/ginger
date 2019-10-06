import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema, GeneratingSchemaError } from 'type-graphql';
import { RecipeResolver } from './resolvers/RecipeResolver';
import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typedi';

useContainer(Container);
async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [`${__dirname}/resolvers/*.ts`],
    container: Container
  });

  const apollo = new ApolloServer({ schema });

  // const seq = new Sequelize(process.env.DATABASE_URL as string, {
  //   models: [`${__dirname}/data-types/**/*.ts`]
  // });
  const dbConnection = await createConnection({
    type: 'postgres',
    url: process.env!.DATABASE_URL,
    entities: [`${__dirname}/data-types/**/*.ts`],
    synchronize: true // Will force-update schema min production
  });

  const app = express();
  apollo.applyMiddleware({ app });

  app.listen({ port: 5000 }, () => {
    console.log(`Ready at localhost:5000${apollo.graphqlPath}`);
  });
}

bootstrap().catch(e => {
  if (e instanceof GeneratingSchemaError) {
    console.error(e.details[0]);
  } else {
    throw e;
  }
});
