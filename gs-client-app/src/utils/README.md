# 유틸리티 함수 사용 가이드

dateFormat 부분은 분리해놓는게 재사용성이 좋아서 이쪽으로 분리

## Vue vs React 비교

### Vue 3 (Composition API) 방식

Vue에서는 유틸리티 함수를 별도 파일로 분리하여 사용합니다.

#### 유틸리티 함수 생성 (`utils/dateFormatter.ts`)

```typescript
// 순수 함수로 작성 (상태 없음)
export function formatDate(dateValue: any, locale: string = 'ko-KR'): string {
    // ... 구현
}
```

#### 컴포넌트에서 사용

```vue
<script setup>
// 직접 import하여 사용
import { formatDate } from '@/utils/dateFormatter'

// 템플릿이나 함수에서 바로 사용
const formatted = formatDate(comment.createdAt)
</script>

<template>
    <div>{{ formatDate(comment.createdAt) }}</div>
</template>
```

- 간단하고 직관적
- 순수 함수로 재사용 가능
- 컴포넌트와 분리되어 테스트 용이
- TypeScript 타입 지원

---

### React 방식

React에서도 유사하지만, Hook 패턴을 사용할 수도 있습니다.

#### 유틸리티 함수 방식 (Vue와 동일)

```typescript
// utils/dateFormatter.ts
export function formatDate(dateValue: any, locale: string = 'ko-KR'): string {
    // ... 구현
}
```

#### 리액트 컴포넌트에서 사용

```tsx
import { formatDate } from '@/utils/dateFormatter'

function CommentsPanel() {
    return (
        <div>{formatDate(comment.createdAt)}</div>
    )
}
```

#### Custom Hook 방식 (React 스타일)

```typescript
// hooks/useDateFormatter.ts
export function useDateFormatter() {
    const formatDate = (dateValue: any, locale: string = 'ko-KR') => {
        // ... 구현
    }
    
    return { formatDate }
}
```

```tsx
// 컴포넌트에서 사용
import { useDateFormatter } from '@/hooks/useDateFormatter'

function CommentsPanel() {
    const { formatDate } = useDateFormatter()
    return <div>{formatDate(comment.createdAt)}</div>
}
```

- React는 Hook 패턴을 선호하지만, 순수 함수도 많이 사용
- Vue는 일반적으로 순수 함수를 선호 (더 간단함)

---

## Vue Composable 패턴 (고급)

만약 날짜 포맷팅에 상태나 반응성이 필요하다면 Composable을 사용할 수 있습니다:

```typescript
// composables/useDateFormatter.ts
import { ref, computed } from 'vue'
import { formatDate as formatDateUtil } from '@/utils/dateFormatter'

export function useDateFormatter(locale = 'ko-KR') {
    const currentLocale = ref(locale)
    
    const formatDate = (dateValue: any) => {
        return formatDateUtil(dateValue, currentLocale.value)
    }
    
    const setLocale = (newLocale: string) => {
        currentLocale.value = newLocale
    }
    
    return {
        formatDate,
        setLocale,
        locale: computed(() => currentLocale.value)
    }
}
```

```vue
<script setup>
import { useDateFormatter } from '@/composables/useDateFormatter'

const { formatDate } = useDateFormatter('ko-KR')
</script>
```

사용 상황

- 순수 함수: 단순 변환 로직 (현재 `formatDate`처럼)
- Composable: 상태나 반응성이 필요한 경우

---

## 현재 프로젝트 구조

```bat
src/
├── utils/              # 순수 유틸리티 함수
│   ├── dateFormatter.ts
│   └── README.md
├── composables/        # Vue Composable (필요시)
└── components/         # Vue 컴포넌트
```

### 권장 사항

- 단순 변환/계산 로직 → `utils/`
- 상태가 있는 로직 → `composables/`
- 재사용 가능한 UI → `components/`
