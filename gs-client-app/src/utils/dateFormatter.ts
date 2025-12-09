/**
 * 날짜 포맷팅 유틸리티
 * 
 * Java LocalDateTime 배열 형식 [year, month, day, hour, minute, second, nanoseconds]
 * 및 ISO 문자열 형식을 지원합니다.
 */

/**
 * 날짜 값을 포맷팅된 문자열로 변환
 * 
 * @param dateValue - 날짜 값 (배열, ISO 문자열, Date 객체)
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷팅된 날짜 문자열
 * 
 * @example
 * formatDate([2025, 12, 5, 6, 38, 52, 696008000])
 * // => "2025. 12. 5. 오전 6:38:52"
 * 
 * formatDate('2025-12-05T06:38:52')
 * // => "2025. 12. 5. 오전 6:38:52"
 */
export function formatDate(dateValue: any, locale: string = 'ko-KR'): string {
    if (!dateValue) return '';
    
    try {
        // 배열 형식인 경우: [year, month, day, hour, minute, second, nanoseconds]
        // Java LocalDateTime을 JSON으로 직렬화한 형식
        if (Array.isArray(dateValue) && dateValue.length >= 6) {
            const [year, month, day, hour = 0, minute = 0, second = 0, nanoseconds = 0] = dateValue;
            
            // month는 1-based이므로 1을 빼야 함 (Java LocalDateTime은 1-based, JS Date는 0-based)
            // nanoseconds를 milliseconds로 변환 (1초 = 1,000,000,000 나노초)
            const milliseconds = Math.floor(nanoseconds / 1000000);
            const date = new Date(year, month - 1, day, hour, minute, second, milliseconds);
            return date.toLocaleString(locale);
        }
        
        // ISO 문자열 형식인 경우
        if (typeof dateValue === 'string') {
            return new Date(dateValue).toLocaleString(locale);
        }
        
        // 이미 Date 객체인 경우
        if (dateValue instanceof Date) {
            return dateValue.toLocaleString(locale);
        }
        
        return String(dateValue);
    } catch (e) {
        console.warn('날짜 파싱 실패:', dateValue, e);
        return String(dateValue);
    }
}

/**
 * 날짜를 상대 시간으로 표시 (예: "3분 전", "2시간 전")
 * 
 * @param dateValue - 날짜 값
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(dateValue: any): string {
    if (!dateValue) return '';
    
    try {
        let date: Date;
        
        // 배열 형식 처리
        if (Array.isArray(dateValue) && dateValue.length >= 6) {
            const [year, month, day, hour = 0, minute = 0, second = 0, nanoseconds = 0] = dateValue;
            const milliseconds = Math.floor(nanoseconds / 1000000);
            date = new Date(year, month - 1, day, hour, minute, second, milliseconds);
        } else if (typeof dateValue === 'string') {
            date = new Date(dateValue);
        } else if (dateValue instanceof Date) {
            date = dateValue;
        } else {
            return String(dateValue);
        }
        
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return '방금 전';
        if (diffMin < 60) return `${diffMin}분 전`;
        if (diffHour < 24) return `${diffHour}시간 전`;
        if (diffDay < 7) return `${diffDay}일 전`;
        
        return formatDate(dateValue);
    } catch (e) {
        console.warn('상대 시간 계산 실패:', dateValue, e);
        return formatDate(dateValue);
    }
}

