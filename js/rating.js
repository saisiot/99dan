// 레이팅 계산 및 랭킹 관리 클래스
class RatingSystem {
    constructor() {
        this.storage = storage;

        // 단수별 점수 (30초 모드 기준)
        this.scoreTable30 = {
            2: 10, 3: 15, 4: 20, 5: 25,
            6: 30, 7: 40, 8: 50, 9: 60
        };

        // 단수별 점수 (60초 모드 = 30초의 2배)
        this.scoreTable60 = {
            2: 20, 3: 30, 4: 40, 5: 50,
            6: 60, 7: 80, 8: 100, 9: 120
        };

        // 시간 모드별 최대 점수
        this.maxScores = {
            30: 600,    // 30초: 약 10문제 × 평균 60점
            60: 2400    // 60초: 약 20문제 × 평균 120점
        };
    }

    // 단수에 따른 점수 가져오기
    getScoreByTable(table, timeMode) {
        if (timeMode === 30) {
            return this.scoreTable30[table] || 0;
        } else {
            return this.scoreTable60[table] || 0;
        }
    }

    // 점수 → 레이팅 변환
    calculateRating(score, timeMode, maxTable) {
        const maxScore = this.maxScores[timeMode];

        // 점수 비율
        const scoreRatio = Math.min(1, score / maxScore);

        // 레이팅 계산 (최대 3000점)
        let rating = Math.floor(scoreRatio * 3000);

        // 보너스: 고단수 선택 시
        if (maxTable >= 8) {
            rating += 100;
        } else if (maxTable >= 6) {
            rating += 50;
        }

        return Math.min(3000, rating);
    }

    // 랭킹 계산 (가상 사용자 포함)
    getRanking(userRating) {
        const allPlayers = [
            ...virtualPlayers,
            { name: '제하', rating: userRating, isPlayer: true }
        ];

        allPlayers.sort((a, b) => b.rating - a.rating);

        const myRank = allPlayers.findIndex(p => p.isPlayer) + 1;
        return { myRank, allPlayers };
    }

    // 순위 변동 계산
    getRankChange() {
        const rating = this.storage.getRating();
        return rating.previousRank - rating.currentRank;
    }

    // 잠금 해제 체크
    checkUnlock(maxTable) {
        const settings = this.storage.getSettings();
        const age = settings.childAge;

        // 연령별 기준 정답률
        let threshold = 0.80;
        if (age <= 7) {
            threshold = 0.70;
        } else if (age <= 10) {
            threshold = 0.75;
        }

        // 최근 3회 해당 범위 플레이 기록 가져오기
        const records = this.storage.getDailyRecords(30);
        const recentPlays = records
            .filter(r => r.maxTable === maxTable)
            .slice(-3);

        if (recentPlays.length < 1) {
            return false;
        }

        // 평균 정답률 계산
        const avgCorrectRate = recentPlays.reduce((sum, play) =>
            sum + play.correctRate, 0) / recentPlays.length;

        return avgCorrectRate >= threshold;
    }

    // 범위별 잠금 상태
    getTableLockStatus() {
        const status = {};
        const settings = this.storage.getSettings();
        const age = settings.childAge;

        // 연령별 기준 정답률
        let threshold = 80;
        if (age <= 7) {
            threshold = 70;
        } else if (age <= 10) {
            threshold = 75;
        }

        for (let table = 2; table <= 9; table++) {
            if (table === 2) {
                status[table] = {
                    unlocked: true,
                    progress: 100,
                    threshold
                };
            } else {
                const unlocked = this.checkUnlock(table - 1);
                const progress = this.getProgress(table - 1);
                status[table] = {
                    unlocked,
                    progress: Math.round(progress),
                    threshold
                };
            }
        }

        return status;
    }

    // 진행률 계산
    getProgress(maxTable) {
        const records = this.storage.getDailyRecords(30);
        const recentPlays = records
            .filter(r => r.maxTable === maxTable)
            .slice(-3);

        if (recentPlays.length === 0) {
            return 0;
        }

        const avgCorrectRate = recentPlays.reduce((sum, play) =>
            sum + play.correctRate, 0) / recentPlays.length;

        return avgCorrectRate * 100;
    }

    // 레이팅에 따른 순위 아이콘
    getRankIcon(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 10) return '🏆';
        if (rank <= 30) return '🎖️';
        if (rank <= 60) return '🎯';
        return '📊';
    }

    // 레이팅에 따른 칭호
    getRankTitle(rating) {
        if (rating >= 2700) return '천재';
        if (rating >= 2200) return '최고수';
        if (rating >= 1600) return '고수';
        if (rating >= 1000) return '중수';
        if (rating >= 500) return '초보';
        return '입문';
    }
}

// 전역 인스턴스
const ratingSystem = new RatingSystem();
