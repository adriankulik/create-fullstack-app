import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/multiply', (req: Request, res: Response) => {
  const { number } = req.body;
  if (typeof number !== 'number') {
    return res.status(400).json({ error: 'Invalid number' });
  }
  return res.json({ result: number * 2 });
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
