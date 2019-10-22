import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema, GeneratingSchemaError } from 'type-graphql';
import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typedi';
import { Context } from './Context';
import { Authenticator } from './AuthChecker';

useContainer(Container);
async function bootstrap() {
  console.log('Connecting to database...');
  await createConnection({
    type: 'postgres',
    url: process.env!.DATABASE_URL,
    entities: [`${__dirname}/data-types/**/*.ts`],
    synchronize: true // Will force-update schema min production
  });

  console.log('Building schema...');
  const schema = await buildSchema({
    resolvers: [`${__dirname}/resolvers/*.ts`],
    container: Container,
    authChecker: Container.get(Authenticator).authChecker
  });

  const apollo = new ApolloServer({
    schema,
    context({ req }): Context {
      return {
        userId: req.cookies.userId
      };
    }
  });

  const app = express();
  app.use(cookieParser());
  apollo.applyMiddleware({
    app,
    cors: {
      credentials: true,
      origin: (requestOrigin, callback) => {
        callback(null, true);
      }
    }
  });

  app.listen({ port: 5000 }, () => {
    console.log(`Ready at http://localhost:5000${apollo.graphqlPath}`);
  });
}

bootstrap().catch(e => {
  if (e instanceof GeneratingSchemaError) {
    console.error(e.details[0]);
  } else {
    throw e;
  }
});
