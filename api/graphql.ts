import { NowRequest, NowResponse } from '@vercel/node';
import dotenv from 'dotenv';
import 'reflect-metadata';
import { MiddlewareFn, buildSchema } from 'type-graphql';
import Container from 'typedi';
import { createConnection, useContainer, Connection, getConnection } from 'typeorm';
import { ApolloServer } from 'apollo-server-micro';
import { Authenticator } from '../src/backend/AuthChecker';
import { Context } from '../src/backend/Context';
import { Bookmark } from '../src/backend/data-types/Bookmark';
import { InfiniteRecipeScrollResult } from '../src/backend/data-types/InfiniteRecipeScrollResult';
import { Rating } from '../src/backend/data-types/Rating';
import { Recipe } from '../src/backend/data-types/Recipe';
import { User } from '../src/backend/data-types/User';
import { RecipeResolver } from '../src/backend/resolvers/RecipeResolver';
import { UserResolver } from '../src/backend/resolvers/UserResolver';

useContainer(Container);

const interceptErrors: MiddlewareFn<Context> = ({ context, info }, next) => {
  return next().catch(err => {
    console.error('An error occurred in a resolver or service:', err, '\nQuery info:', info);
    throw new Error('Internal server error');
  });
};

export default async function(req: NowRequest, res: NowResponse) {
  // skip dotenv loading in production where all environment variables are provided through vercel
  if (process.env.NO_DOTENV !== '1') {
    dotenv.config();
  }
  const url =
    process.env.NODE_ENV === 'test' ? process.env!.TEST_DATABASE_URL : process.env!.DATABASE_URL;
  if (getConnection() == null) {
    await createConnection({
      type: 'postgres',
      url,
      entities: [Bookmark, InfiniteRecipeScrollResult, Rating, Recipe, User],
      synchronize: true // Will force-update schema in production
    });
  }

  const schema = await buildSchema({
    resolvers: [RecipeResolver, UserResolver],
    container: Container,
    authChecker: Container.get(Authenticator).authChecker,
    globalMiddlewares: [interceptErrors]
  });

  const handler = new ApolloServer({
    schema,
    context({ req: _req }): Context {
      return {
        userId: (_req as NowRequest).cookies.userId
      };
    }
  }).createHandler({ path: '/api/graphql' });

  return handler(req, res);
}
