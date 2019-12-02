import { request } from '../utils';

it('creates a user account', async () => {
  console.log('doing request');
  const response = await request(`
    mutation {
      createAccount
    }
  `);
  console.log('expecting something unreasonable');
  expect(response).toBe('blah');
  // expect(8).toEqual(8);
});
