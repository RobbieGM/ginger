import 'reflect-metadata';
import express from 'express';
import { GeneratingSchemaError } from 'type-graphql';
import { applyApiServerMiddleware } from '../api-middleware';

// const app = express();

export default async function startApiTestServer() {
  // try {
  //   await applyApiServerMiddleware(app);
  //   global.TEST_SERVER = app.listen({ port: 5001 });
  // } catch (e) {
  //   if (e instanceof GeneratingSchemaError) {
  //     console.error(e.details[0]);
  //   } else {
  //     console.error(e);
  //   }
  // }
}
