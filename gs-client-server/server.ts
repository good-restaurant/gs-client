import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import * as fs from 'node:fs';
import * as https from 'node:https';
import { join } from 'node:path';
// @ts-ignore
import selfsigned from 'selfsigned';

dotenv.config();

const app = express();
const PORT: number = Number.parseInt(process.env.PORT || '3000', 10);
const USE_HTTPS: boolean = process.env.USE_HTTPS === 'true';

// Vite 빌드된 정적 파일 경로
const DIST_PATH = join(__dirname, '../client');

// 자체 서명 인증서 생성 함수 (selfsigned 패키지 사용)
function generateSelfSignedCert(): { key: string; cert: string } {
  try {
    // selfsigned 패키지를 사용하여 올바른 X.509 인증서 생성
    const attrs = [
      { name: 'commonName', value: 'localhost' },
      { name: 'countryName', value: 'KR' },
      { name: 'stateOrProvinceName', value: 'Seoul' },
      { name: 'localityName', value: 'Seoul' },
      { name: 'organizationName', value: 'Dev' },
      { name: 'organizationalUnitName', value: 'IT' }
    ];
    
    const pems = selfsigned.generate(attrs, {
      keySize: 2048,
      days: 365,
      algorithm: 'sha256'
    });
    
    console.log('🔒 selfsigned 패키지로 자체 서명 인증서가 생성되었습니다.');
    
    return {
      key: pems.private,
      cert: pems.cert
    };
  } catch (error) {
    console.error('❌ 자체 서명 인증서 생성 실패:', error);
    throw error;
  }
}

// HTTPS 설정 (개발용 자체 서명 인증서)
let httpsOptions: https.ServerOptions | undefined;
if (USE_HTTPS) {
  try {
    // 기존 인증서 파일이 있는지 확인
    const keyPath = join(__dirname, '../../gs-client-app/dev-naver.i4624.info-key.pem');
    const certPath = join(__dirname, '../../gs-client-app/dev-naver.i4624.info.pem');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      console.log('🔒 기존 HTTPS 인증서를 사용합니다.');
    } else {
      console.log('⚠️  기존 HTTPS 인증서 파일을 찾을 수 없습니다. 자체 서명 인증서를 생성합니다.');
      const selfSignedCert = generateSelfSignedCert();
      httpsOptions = {
        key: selfSignedCert.key,
        cert: selfSignedCert.cert
      };
    }
  } catch (error) {
    console.log('⚠️  HTTPS 설정 중 오류가 발생했습니다. HTTP로 실행됩니다.');
    console.error('HTTPS 설정 오류:', error);
  }
}

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

// 서버 시작
if (USE_HTTPS && httpsOptions) {
  https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS Server running on https://localhost:${PORT}`);
    console.log(`🔒 HTTPS Server running on https://0.0.0.0:${PORT}`);
  });
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP Server running on http://localhost:${PORT}`);
    console.log(`🌐 HTTP Server running on http://0.0.0.0:${PORT}`);
  });
}

