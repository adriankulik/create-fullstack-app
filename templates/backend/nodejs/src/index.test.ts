import request from 'supertest';
import app from './index';
import { describe, it, expect } from 'vitest';

describe('Multiply API', () => {
  it('should multiply a valid number by 2', async () => {
    const res = await request(app)
      .post('/api/multiply')
      .send({ number: 5 });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ result: 10 });
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/multiply')
      .send({ number: 'not a number' });
    
    expect(res.statusCode).toEqual(400);
  });
});
