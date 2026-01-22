// 약점 분석 클래스
class WeaknessAnalyzer {
    constructor() {
        this.storage = storage;
    }

    // 오답률 높은 문제 추출
    getWeakQuestions(minIncorrectRate = 0.3) {
        const mastery = this.storage.getQuestionMastery();
        const weak = [];

        for (const [question, data] of Object.entries(mastery)) {
            const total = data.correct + data.incorrect;
            if (total >= 3) {
                const incorrectRate = data.incorrect / total;
                if (incorrectRate >= minIncorrectRate && !data.conquered) {
                    const priority = this.calculatePriority(data);
                    weak.push({
                        question,
                        priority,
                        incorrectRate,
                        data
                    });
                }
            }
        }

        // 우선순위 순으로 정렬
        weak.sort((a, b) => b.priority - a.priority);
        return weak;
    }

    // 우선순위 계산
    calculatePriority(questionData) {
        const total = questionData.correct + questionData.incorrect;
        const incorrectRate = questionData.incorrect / total;

        // 최근 안 푼 문제 우선
        let recencyFactor = 0;
        if (questionData.lastPracticed) {
            const daysSince = Math.floor(
                (Date.now() - new Date(questionData.lastPracticed).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            recencyFactor = Math.min(1, daysSince / 7);
        } else {
            recencyFactor = 1;
        }

        // 오답률 70% + 최근 안 푼 정도 30%
        return incorrectRate * 0.7 + recencyFactor * 0.3;
    }

    // 정복 여부 체크
    checkConquered(question) {
        const mastery = this.storage.getQuestionMastery();
        return mastery[question]?.conquered || false;
    }

    // 정복한 문제 수
    getConqueredCount() {
        const mastery = this.storage.getQuestionMastery();
        let count = 0;

        for (const data of Object.values(mastery)) {
            if (data.conquered) {
                count++;
            }
        }

        return count;
    }

    // 전체 문제 중 정복 비율
    getProgressRate() {
        const total = 64; // 2x2 ~ 9x9
        const conquered = this.getConqueredCount();
        return conquered / total;
    }

    // 약점 문제 업데이트 및 저장
    updateWeakQuestions() {
        const weak = this.getWeakQuestions();
        this.storage.save(this.storage.KEYS.WEAK_QUESTIONS, weak);
        return weak;
    }

    // 문제를 정복으로 표시
    markAsConquered(question) {
        const mastery = this.storage.getQuestionMastery();
        if (mastery[question]) {
            mastery[question].conquered = true;
            this.storage.save(this.storage.KEYS.QUESTION_MASTERY, mastery);
        }
    }

    // 특정 단의 약점 문제 가져오기
    getWeakQuestionsByTable(table) {
        const weak = this.getWeakQuestions();
        return weak.filter(w => {
            const [multiplicand] = w.question.split('x');
            return parseInt(multiplicand) === table;
        });
    }

    // 가장 어려운 단 찾기
    getHardestTable() {
        const tableStats = statisticsManager.getTableStatistics();
        let hardest = 2;
        let lowestRate = 1;

        for (let table = 2; table <= 9; table++) {
            if (tableStats[table].total >= 5 && tableStats[table].rate < lowestRate) {
                lowestRate = tableStats[table].rate;
                hardest = table;
            }
        }

        return { table: hardest, rate: lowestRate };
    }

    // 학습 추천
    getRecommendation() {
        const weak = this.getWeakQuestions();
        const hardest = this.getHardestTable();
        const progress = this.getProgressRate();

        if (weak.length === 0) {
            return {
                type: 'perfect',
                message: '모든 문제를 정복했습니다! 완벽 도전을 해보세요.',
                action: 'perfect'
            };
        }

        if (weak.length >= 10) {
            return {
                type: 'weakness',
                message: `약점 문제가 ${weak.length}개 있습니다. 약점 집중 모드를 추천합니다.`,
                action: 'weakness'
            };
        }

        if (hardest.rate < 0.6) {
            return {
                type: 'step',
                message: `${hardest.table}단 정답률이 낮습니다. 단계별 학습을 추천합니다.`,
                action: 'stepByStep'
            };
        }

        return {
            type: 'practice',
            message: '자유 연습으로 실력을 유지하세요!',
            action: 'practice'
        };
    }
}

// 전역 인스턴스
const weaknessAnalyzer = new WeaknessAnalyzer();
