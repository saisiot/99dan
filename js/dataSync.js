// 데이터 동기화 클래스 (코드 기반 기기 간 이동)
class DataSyncManager {
    constructor() {
        this.storage = storage;
    }

    // 데이터 → 동기화 코드 생성
    generateSyncCode() {
        try {
            // 모든 게임 데이터를 JSON으로 직렬화
            const data = this.storage.exportAllData();

            // JSON → 문자열
            const jsonString = JSON.stringify(data);

            // Base64 인코딩
            const base64 = btoa(unescape(encodeURIComponent(jsonString)));

            // 6자리 청크로 분할 (읽기 쉽게)
            const chunks = base64.match(/.{1,6}/g) || [];
            const code = chunks.join('-');

            return code;
        } catch (error) {
            console.error('Sync code generation error:', error);
            return null;
        }
    }

    // 코드 → 데이터 복원
    importFromCode(code) {
        try {
            // 하이픈 제거
            const base64 = code.replace(/-/g, '');

            // Base64 디코딩
            const jsonString = decodeURIComponent(escape(atob(base64)));

            // JSON 파싱
            const data = JSON.parse(jsonString);

            // 데이터 유효성 검사
            if (!this.validateData(data)) {
                throw new Error('Invalid data format');
            }

            // 데이터 복원
            this.storage.restoreAllData(data);

            return {
                success: true,
                message: '데이터 복원 완료! 🎉'
            };
        } catch (error) {
            console.error('Import error:', error);
            return {
                success: false,
                message: '잘못된 코드입니다. 다시 확인해주세요.'
            };
        }
    }

    // 데이터 유효성 검사
    validateData(data) {
        // 필수 키 체크
        const requiredKeys = ['RATING', 'STATISTICS', 'SETTINGS'];
        for (const key of requiredKeys) {
            if (!data[key]) {
                return false;
            }
        }

        // 레이팅 범위 체크
        if (data.RATING.currentRating < 0 || data.RATING.currentRating > 3000) {
            return false;
        }

        return true;
    }

    // 코드를 클립보드에 복사
    async copyCodeToClipboard(code) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(code);
                return true;
            } else {
                // 폴백: textarea 사용
                const textarea = document.createElement('textarea');
                textarea.value = code;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error('Copy error:', error);
            return false;
        }
    }

    // 코드 길이 계산
    getCodeLength(code) {
        return code.length;
    }

    // 코드를 읽기 쉬운 형식으로 포맷
    formatCode(code) {
        // 30자마다 줄바꿈
        const chunks = code.match(/.{1,30}/g) || [];
        return chunks.join('\n');
    }

    // 데이터 크기 계산
    getDataSize() {
        const data = this.storage.exportAllData();
        const jsonString = JSON.stringify(data);
        return jsonString.length;
    }

    // 데이터 요약 정보
    getDataSummary() {
        const data = this.storage.exportAllData();

        return {
            rating: data.RATING?.currentRating || 0,
            rank: data.RATING?.currentRank || 100,
            totalGames: data.STATISTICS?.totalGamesPlayed || 0,
            totalScore: data.STATISTICS?.totalScore || 0,
            streak: data.PLAY_STREAK?.currentStreak || 0,
            lastPlayed: data.PLAY_STREAK?.lastPlayedDate || null
        };
    }

    // 내보내기 전 데이터 요약 표시
    getExportSummary() {
        const summary = this.getDataSummary();
        const size = this.getDataSize();

        return `
📊 레이팅: ${summary.rating}점
🏆 순위: ${summary.rank}위
🎮 총 게임: ${summary.totalGames}회
⭐ 누적 점수: ${summary.totalScore}점
🔥 연속: ${summary.streak}일
📦 데이터 크기: ${(size / 1024).toFixed(2)}KB
        `.trim();
    }
}

// 전역 인스턴스
const dataSyncManager = new DataSyncManager();
