import 'reflect-metadata';
import express from 'express';
import { GeneratingSchemaError } from 'type-graphql';
import { applyApiServerMiddleware } from '../api-middleware';

const app = express();

export default async function startApiTestServer() {
  try {
    await applyApiServerMiddleware(app);
    global.TEST_SERVER = app.listen({ port: 5001 });
  } catch (e) {
    if (e instanceof GeneratingSchemaError) {
      console.error(e.details[0]);
    } else {
      console.error(e);
    }
  }
}

// import { spawn } from 'child_process';
// import express from 'express';

// export default function startApiTestServer() {
//   return new Promise<void>((res, rej) => {
//     const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
//     global.TEST_SERVER = spawn(npm, ['run', 'backend-dev', '-p', '5001'], {
//       stdio: 'inherit',
//       detached: true,
//       env: {
//         ...process.env,
//         PORT: '5001'
//       }
//     });
//     global.TEST_SERVER.stdout?.on('data', data => {
//       if (data.toString().includes('Ready')) {
//         res();
//       }
//     });
//   });
// }
