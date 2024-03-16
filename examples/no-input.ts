import express from 'express';
import { parsingMiddleWare } from '../src/zodExpressLite';

const app = express();
app.use(express.json());

async function getAllUsers(): Promise<string[]> {
  return [];
}

/**
 * In some cases your handlers may not require any input. In this case, you can
 * use the parsingMiddleWare function without a schema
 */
app.post('/get-user-name', parsingMiddleWare(getAllUsers));


