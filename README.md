# GS Client

Vue.js + Vite 프론트엔드와 Express 백엔드가 통합된 프로젝트입니다.

## 프로젝트 구조

```bash
gs-client/
├── gs-client-app/          # Vue.js + Vite 프론트엔드
│   ├── src/
│   └── package.json
├── gs-client-server/       # Express 백엔드 서버
│   ├── server.ts
│   └── package.json
├── dist/                   # 통합 빌드 결과물
│   ├── client/            # 프론트엔드 빌드 결과물
│   │   ├── index.html
│   │   └── assets/
│   └── server/            # 백엔드 빌드 결과물
│       └── server.js
└── package.json           # 루트 통합 관리
```

## 빠른 시작

### 1. 의존성 설치

```bash
## app, server, root 각각 node_modules 추가됨
npm run install:all
```

### 2. 개발 모드

```bash
# 프론트엔드만 개발
npm run dev:app

# 백엔드만 개발  
npm run dev:server

# 프론트엔드 + 백엔드 동시 개발
npm run dev
```

### 3. 프로덕션 빌드 및 실행

```bash
# 전체 빌드
npm run build

# 빌드 후 서버 실행
npm run deploy
```

## 사용 가능한 스크립트

- `npm run dev:app` - 프론트엔드 개발 서버 실행
- `npm run dev:server` - 백엔드 개발 서버 실행
- `npm run dev` - 프론트엔드 + 백엔드 동시 개발
- `npm run build:app` - 프론트엔드 빌드
- `npm run build:server` - 백엔드 빌드
- `npm run build` - 전체 빌드
- `npm start` - 프로덕션 서버 실행
- `npm run deploy` - 빌드 후 HTTP 서버 실행
- `npm run deploy:https` - 빌드 후 HTTPS 서버 실행
- `npm run start:https` - HTTPS 서버 실행
- `npm run clean` - dist 폴더 정리

## 포트 정보

- **프론트엔드 개발**: `http://localhost:5173` (Vite)
- **백엔드 개발**: `http://localhost:3000` (Express)
- **프로덕션 HTTP**: `http://localhost:3000` (Express가 정적 파일 서빙)
- **프로덕션 HTTPS**: `https://localhost:3000` (Express가 정적 파일 서빙)

## HTTPS 설정

### HTTP 서버 실행

```bash
npm start
npm run deploy
```

### HTTPS 서버 실행

```bash
npm run start:https
npm run deploy:https
```

### 주의사항

vite 개발 환경에서 HTTPS를 사용하려면 `gs-client-app` 폴더에 다음 인증서 파일이 필요합니다.
express에서는 상관없음.

- `dev-naver.i4624.info-key.pem` (개인키)
- `dev-naver.i4624.info.pem` (인증서)

mkcert 혹은 기타 셀프 사인 인증서 등을 사용할 수 있습니다.
