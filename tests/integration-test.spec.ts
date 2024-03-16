import axios from 'axios';
import { initServer } from  './test-server';
import { parsingMiddleWare } from '../src/zodExpressLite';
import { Application } from 'express';
import z from 'zod';

const serverConfig = {
  port: 3039
};

const testClient = axios.create({ baseURL: `http://127.0.0.1:${serverConfig.port}` });

let shutdownServer: () => Promise<void>;

const sanityTestRouteDefinition = (app: Application) => {
  const User = z.object({
    name: z.string(),
    id: z.string(),
  });
  type User = z.infer<typeof User>;

  const createUser = async (user: User) => {
    expect(user.name).toBe('John');
    return { age: 30 };
  };

  app.post('/users', parsingMiddleWare(createUser, User));
};

describe('Express end to end test', () => {
  beforeAll(async () => {
    shutdownServer = await initServer([sanityTestRouteDefinition], serverConfig);
  });

  afterAll(async () => {
    await shutdownServer();
  });

  it('Should return 200', async () => {
    const response = await testClient.post('/users', { name: 'John', id: '12323232' });
    expect(response.status).toBe(200);
  });

  it('Should return 400 when the input is invalid', async () => {
    const response = await testClient.post('/users', { name: 'John', id: 123 },
      { validateStatus: (status) => status === 400 });
    expect(response.status).toBe(400);
  });
});

describe('Unexpected error in handler', () => {

  beforeAll(async () => {
    shutdownServer = await initServer([faultyRoutes], serverConfig);
  });

  afterAll(async () => {
    await shutdownServer();
  });

  const faultyRoutes = (app: Application) => {
    app.post('/error', parsingMiddleWare(() => {
      throw new Error('This is an unexpected error');
    }));
  };

  it('Should return 500', async () => {
    const response = await testClient.post('/error', { name: 'John', id: '12323232' },
      { validateStatus: (status) => status === 500 });
    expect(response.status).toBe(500);
  });
});