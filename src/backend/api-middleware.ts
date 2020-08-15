// import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import { buildSchema, MiddlewareFn } from 'type-graphql';
import { Container } from 'typedi';
import { createConnection, useContainer } from 'typeorm';
import { Authenticator } from './AuthChecker';
import { Context } from './Context';
import { Bookmark } from './data-types/Bookmark';
import { InfiniteRecipeScrollResult } from './data-types/InfiniteRecipeScrollResult';
import { Rating } from './data-types/Rating';
import { Recipe } from './data-types/Recipe';
import { User } from './data-types/User';
import { RecipeResolver } from './resolvers/RecipeResolver';
import { UserResolver } from './resolvers/UserResolver';

const interceptErrors: MiddlewareFn<Context> = ({ context, info }, next) => {
  return next().catch(err => {
    console.error('An error occurred in a resolver or service:', err, '\nQuery info:', info);
    throw new Error('Internal server error');
  });
};

useContainer(Container);
export async function applyApiServerMiddleware(app: express.Express) {
  const url =
    process.env.NODE_ENV === 'test' ? process.env!.TEST_DATABASE_URL : process.env!.DATABASE_URL;
  console.log(`Connecting to database at ${url} ...`);
  await createConnection({
    type: 'postgres',
    url,
    entities: [Bookmark, InfiniteRecipeScrollResult, Rating, Recipe, User],
    synchronize: true // Will force-update schema in production
  });

  console.log('Building schema...');
  const schema = await buildSchema({
    resolvers: [RecipeResolver, UserResolver],
    container: Container,
    authChecker: Container.get(Authenticator).authChecker,
    globalMiddlewares: [interceptErrors]
  });

  const apollo = new ApolloServer({
    schema,
    context({ req }): Context {
      return {
        userId: (req as express.Request).cookies.userId
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
