import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { join } from 'node:path';

dotenv.config();

const app = express();
const PORT: number = Number.parseInt(process.env.PORT || '3000', 10);

// Vite 빌드된 정적 파일 경로
const DIST_PATH = join(__dirname, '../client');

// 미들웨어
app.use(helmet({
  contentSecurityPolicy: false, // SPA에서 필요할 수 있음
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (Vite 빌드 결과물)
app.use(express.static(DIST_PATH));

// 라우트
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/restaurants', (req: Request, res: Response) => {
  // 임시 데이터
  const restaurants = [
    { id: 1, name: '맛있는 식당', address: '서울시 강남구', rating: 4.5 },
    { id: 2, name: '좋은 음식점', address: '서울시 홍대', rating: 4.2 }
  ];
  res.json(restaurants);
});

app.get('/api/restaurants/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // 실제로는 데이터베이스에서 조회
  res.json({ id: Number.parseInt(id), name: '맛있는 식당', address: '서울시 강남구' });
});

// SPA 라우팅을 위한 fallback (모든 라우트를 index.html로 리다이렉트)
app.get('*', (req: Request, res: Response) => {
  res.sendFile(join(DIST_PATH, 'index.html'));
});

// 에러 핸들러
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on port ${PORT}`);
});
