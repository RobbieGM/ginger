export default function teardownTestApiServer() {
  console.info('Shutting down test server');
  global.TEST_SERVER.close();
}
