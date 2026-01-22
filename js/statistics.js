// 통계 및 거리 계산 클래스
class StatisticsManager {
    constructor() {
        this.storage = storage;
    }

    // 누적 거리 계산 (1점 = 1미터)
    calculateCumulativeDistance() {
        const stats = this.storage.getStatistics();
        return stats.totalScore;
    }

    // 현재 도달한 랜드마크 찾기
    getCurrentLandmark() {
        const distance = this.calculateCumulativeDistance();

        // 거리보다 작거나 같은 랜드마크 중 가장 큰 것
        let current = landmarks[0];
        for (const landmark of landmarks) {
            if (distance >= landmark.distance) {
                current = landmark;
            } else {
                break;
            }
        }
        return current;
    }

    // 다음 목표 랜드마크 찾기
    getNextLandmark() {
        const distance = this.calculateCumulativeDistance();

        // 현재 거리보다 큰 첫 번째 랜드마크
        for (const landmark of landmarks) {
            if (distance < landmark.distance) {
                return landmark;
            }
        }
        return landmarks[landmarks.length - 1];
    }

    // 다음 랜드마크까지 남은 거리
    getDistanceToNext() {
        const current = this.calculateCumulativeDistance();
        const next = this.getNextLandmark();
        return next.distance - current;
    }

    // 진행률 계산 (0~1)
    getProgressToNext() {
        const current = this.calculateCumulativeDistance();
        const currentLandmark = this.getCurrentLandmark();
        const nextLandmark = this.getNextLandmark();

        if (currentLandmark.distance === nextLandmark.distance) {
            return 1;
        }

        const range = nextLandmark.distance - currentLandmark.distance;
        const progress = current - currentLandmark.distance;
        return Math.min(1, progress / range);
    }

    // 랜드마크 정보 업데이트
    updateLandmarkInfo() {
        const stats = this.storage.getStatistics();
        const current = this.getCurrentLandmark();
        const next = this.getNextLandmark();
        const distanceToNext = this.getDistanceToNext();

        stats.currentLandmark = current.name;
        stats.nextLandmark = next.name;
        stats.distanceToNext = distanceToNext;

        this.storage.save(this.storage.KEYS.STATISTICS, stats);
    }

    // 거리를 읽기 쉬운 형식으로 변환
    formatDistance(meters) {
        if (meters >= 1000000) {
            return `${(meters / 1000000).toFixed(2)}M km`;
        } else if (meters >= 1000) {
            return `${(meters / 1000).toFixed(2)}km`;
        } else {
            return `${meters}m`;
        }
    }

    // 단별 정답률 계산
    getTableStatistics() {
        const mastery = this.storage.getQuestionMastery();
        const stats = {};

        for (let table = 2; table <= 9; table++) {
            let correct = 0;
            let total = 0;

            for (let multiplier = 2; multiplier <= 9; multiplier++) {
                const key = `${table}x${multiplier}`;
                if (mastery[key]) {
                    correct += mastery[key].correct;
                    total += mastery[key].correct + mastery[key].incorrect;
                }
            }

            stats[table] = {
                correct,
                total,
                rate: total > 0 ? correct / total : 0
            };
        }

        return stats;
    }

    // 전체 통계 가져오기
    getAllStatistics() {
        const stats = this.storage.getStatistics();
        const rating = this.storage.getRating();
        const streak = this.storage.getPlayStreak();
        const tableStats = this.getTableStatistics();
        const distance = this.calculateCumulativeDistance();
        const currentLandmark = this.getCurrentLandmark();
        const nextLandmark = this.getNextLandmark();
        const progress = this.getProgressToNext();

        return {
            ...stats,
            ...rating,
            ...streak,
            tableStats,
            distance,
            currentLandmark,
            nextLandmark,
            progress
        };
    }
}

// 전역 인스턴스
const statisticsManager = new StatisticsManager();
