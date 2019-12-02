import requestPromise from 'request-promise';

const API_TEST_URL = 'http://localhost:5001/graphql';
type Json = string | number | Json[] | { [key: string]: Json };

export function request(query: string, variables?: Json) {
  return requestPromise({
    method: 'POST',
    uri: API_TEST_URL,
    body: { query, variables },
    json: true
  });
}
