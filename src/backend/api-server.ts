import dotenv from 'dotenv';
import express from 'express';
import { GeneratingSchemaError } from 'type-graphql';
import { applyApiServerMiddleware } from './api-middleware';

const app = express();
dotenv.config();

async function bootstrap() {
  const { graphqlPath } = await applyApiServerMiddleware(app);
  const port = process.env.PORT ?? 5000;
  app.listen({ port }, () => {
    console.log(`Ready at http://localhost:${port}${graphqlPath}`);
  });
}

bootstrap().catch(e => {
  if (e instanceof GeneratingSchemaError) {
    console.error(e.details[0]);
  } else {
    console.error(e);
  }
});
