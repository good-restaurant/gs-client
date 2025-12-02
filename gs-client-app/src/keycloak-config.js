// keycloak-config.js

// 현재 origin 추출
const ORIGIN = globalThis.location.origin

// 환경판별
const isLocal =
ORIGIN.startsWith('http://localhost') ||
ORIGIN.startsWith('https://localhost')

const isDevNaver =
ORIGIN.includes('dev-naver.i4624.info')

const isProduction =
ORIGIN === 'https://goodservice.i4624.info'

// 공통 silent-check 기본값
// dev-naver.i4624.info 환경에서는 silent-check 불가능하니 login-required 사용
const silentCheckUrlMap = {
prod: 'https://goodservice.i4624.info/silent-check-sso.html',
local: 'http://localhost:3000/silent-check-sso.html'
}

// Keycloak 옵션 구성
export function buildKeycloakOptions() {
    if (isLocal) {
    return {
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    silentCheckSsoRedirectUri: silentCheckUrlMap.local,
    checkLoginIframe: true
    }
}

if (isProduction) {
    return {
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    silentCheckSsoRedirectUri: silentCheckUrlMap.prod,
    checkLoginIframe: true
    }
}

if (isDevNaver) {
    // dev-naver 에서는 silent-check 불가능, 필요할 때에만 쓰기
    return {
    onload: 'none',
    pkceMethod: 'S256',
    checkLoginIframe: false
    }
}

// fallback(기타 테스트 환경)
return {
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false
}
}
