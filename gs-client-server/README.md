# GS Client Server

Vite로 빌드된 Vue.js 애플리케이션을 서빙하는 Express 서버입니다.

## 프로젝트 구조

```bash
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

### 1. 개발 모드

```bash
# 서버 빌드 및 실행
cd gs-client-server
npm run dev
```

### 2. 자체 빌드 및 배포

```bash
# 서버 빌드 및 실행
cd gs-client-server
npm run deploy
```

이 명령어는 다음을 순차적으로 실행합니다

1. `npm run build` - TypeScript 서버 컴파일
2. `npm start` - 서버 실행

> 프로젝트 루트가 아닌 server 패키지 자체에서 실행하는 것이므로, `gs-client-server/dist` 에 있는 파일을 다루게 됩니다.

```bash
# 서버만 빌드
npm run build

# 서버 실행
npm start
```

## 서버 기능

- 정적 파일 서빙: `../client` 폴더의 빌드된 파일들을 서빙
- SPA 라우팅: 모든 라우트를 `index.html`로 fallback하여 Vue Router 지원

## 포트 설정

기본 포트: `3000`
환경변수 `PORT`로 변경 가능

## 배포 시 주의사항

1. `gs-client-app`에서 `npm run build`를 실행하여 프로젝트 루트에 `dist` 폴더가 생성되어야 함
