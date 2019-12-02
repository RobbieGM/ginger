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
export async function applyApiServerMiddleware(app: express.Express) {
  const url =
    process.env.NODE_ENV === 'test' ? process.env!.TEST_DATABASE_URL : process.env!.DATABASE_URL;
  console.log(`Connecting to database at ${url} ...`);
  await createConnection({
    type: 'postgres',
    url,
    entities: [`${__dirname}/data-types/**/*.ts`],
    synchronize: true // Will force-update schema in production
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
    },
    formatError(err) {
      console.error('error', err, 'stack trace', err.extensions?.exception?.stacktrace);
      return process.env.NODE_ENV === 'production' ? new Error('Internal server error') : err;
    }
  });

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
  return apollo;
}
