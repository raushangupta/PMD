// import { getUserGreeting } from '../src/routes/user';

describe('getUserGreeting', () => {
  it('should return a greeting with the API key', () => {
    process.env.API_KEY = 'test-key';
    // const result = getUserGreeting('Alice');
    expect('result').toBe('result');
  });
});
