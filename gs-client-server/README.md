# GS Client Server

Vite로 빌드된 Vue.js 애플리케이션을 서빙하는 Express 서버입니다.

## 프로젝트 구조

```
gs-client/
├── gs-client-app/          # Vue.js + Vite 애플리케이션
│   ├── src/
│   ├── dist/              # Vite 빌드 결과물 (이 폴더의 파일들을 서빙)
│   └── package.json
└── gs-client-server/       # Express 서버
    ├── server.ts
    ├── dist/              # TypeScript 컴파일 결과물
    └── package.json
```

## 개발 워크플로우

### 1. 개발 모드 (개별 실행)

**클라이언트 개발:**
```bash
cd gs-client-app
npm run dev
```

**서버 개발:**
```bash
cd gs-client-server
npm run dev
```

### 2. 프로덕션 빌드 및 배포

**전체 빌드 및 실행:**
```bash
cd gs-client-server
npm run deploy
```

이 명령어는 다음을 순차적으로 실행합니다:
1. `npm run build:client` - Vue.js 앱 빌드
2. `npm run build` - TypeScript 서버 컴파일
3. `npm start` - 서버 실행

**개별 빌드:**
```bash
# 클라이언트만 빌드
npm run build:client

# 서버만 빌드
npm run build

# 클라이언트 + 서버 빌드
npm run build:all
```

## 서버 기능

- **정적 파일 서빙**: `gs-client-app/dist` 폴더의 빌드된 파일들을 서빙
- **SPA 라우팅**: 모든 라우트를 `index.html`로 fallback하여 Vue Router 지원
- **API 엔드포인트**: 
  - `GET /health` - 서버 상태 확인
  - `GET /api/restaurants` - 레스토랑 목록
  - `GET /api/restaurants/:id` - 특정 레스토랑 정보
- **보안**: Helmet, CORS 설정
- **로깅**: Morgan을 통한 요청 로깅

## 포트 설정

기본 포트: `3000`
환경변수 `PORT`로 변경 가능

## 배포 시 주의사항

1. `gs-client-app`에서 `npm run build`를 실행하여 `dist` 폴더가 생성되어야 함
2. 서버는 `gs-client-app/dist` 폴더의 파일들을 서빙함
3. SPA이므로 모든 라우트가 `index.html`로 fallback됨
