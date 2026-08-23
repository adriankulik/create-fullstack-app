import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@127.0.0.1:5432/appdb'
});

app.post('/api/multiply', async (req: Request, res: Response) => {
  const { number } = req.body;
  if (typeof number !== 'number') {
    return res.status(400).json({ error: 'Invalid number' });
  }
  const result = number * 2;
  try {
    await pool.query('INSERT INTO calculations (input_number, result) VALUES ($1, $2)', [number, result]);
  } catch (error) {
    console.error('Error saving to db:', error);
  }
  return res.json({ result });
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
