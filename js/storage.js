// localStorage 관리 클래스
class StorageManager {
    constructor() {
        this.KEYS = {
            RATING: '99dan_rating',
            STATISTICS: '99dan_statistics',
            DAILY_RECORDS: '99dan_daily_records',
            QUESTION_MASTERY: '99dan_question_mastery',
            STEP_PROGRESS: '99dan_step_progress',
            PLAY_STREAK: '99dan_play_streak',
            WEAK_QUESTIONS: '99dan_weak_questions',
            HIGH_SCORES: '99dan_high_scores',
            SETTINGS: '99dan_settings',
            STEP_RECORDS: '99dan_step_records',
            PRACTICE_STATS: '99dan_practice_stats'
        };

        this.initializeData();
    }

    // 데이터 초기화
    initializeData() {
        // 레이팅 초기화
        if (!this.load(this.KEYS.RATING)) {
            this.save(this.KEYS.RATING, {
                currentRating: 0,
                highestRating: 0,
                currentRank: 100,
                previousRank: 100
            });
        }

        // 통계 초기화
        if (!this.load(this.KEYS.STATISTICS)) {
            this.save(this.KEYS.STATISTICS, {
                totalGamesPlayed: 0,
                gamesBy30sec: 0,
                gamesBy60sec: 0,
                totalQuestionsAnswered: 0,
                totalCorrect: 0,
                totalIncorrect: 0,
                totalScore: 0,
                overallCorrectRate: 0,
                currentLandmark: '시작 지점',
                nextLandmark: '집 앞 편의점',
                distanceToNext: 100
            });
        }

        // 매일 기록 초기화
        if (!this.load(this.KEYS.DAILY_RECORDS)) {
            this.save(this.KEYS.DAILY_RECORDS, []);
        }

        // 문제별 숙달도 초기화
        if (!this.load(this.KEYS.QUESTION_MASTERY)) {
            const mastery = {};
            for (let i = 2; i <= 9; i++) {
                for (let j = 2; j <= 9; j++) {
                    mastery[`${i}x${j}`] = {
                        correct: 0,
                        incorrect: 0,
                        streak: 0,
                        conquered: false,
                        lastPracticed: null
                    };
                }
            }
            this.save(this.KEYS.QUESTION_MASTERY, mastery);
        }

        // 단계별 학습 초기화
        if (!this.load(this.KEYS.STEP_PROGRESS)) {
            this.save(this.KEYS.STEP_PROGRESS, {
                currentStep: 2,
                completedSteps: [],
                stepOrder: [2, 5, 3, 4, 6, 9, 7, 8],
                stepScores: {
                    2: { attempts: 0, correct: 0, correctRate: 0, unlocked: true, completed: false },
                    3: { attempts: 0, correct: 0, correctRate: 0, unlocked: false, completed: false },
                    4: { attempts: 0, correct: 0, correctRate: 0, unlocked: false, completed: false },
                    5: { attempts: 0, correct: 0, correctRate: 0, unlocked: false, completed: false },
                    6: { attempts: 0, correct: 0, correctRate: 0, unlocked: false, completed: false },
                    7: { attempts: 0, correct: 0, correctRate: 0, unlocked: false, completed: false },
                    8: { attempts: 0, correct: 0, correctRate: 0, unlocked: false, completed: false },
                    9: { attempts: 0, correct: 0, correctRate: 0, unlocked: false, completed: false }
                }
            });
        }

        // 연속 플레이 초기화
        if (!this.load(this.KEYS.PLAY_STREAK)) {
            this.save(this.KEYS.PLAY_STREAK, {
                currentStreak: 0,
                longestStreak: 0,
                totalDaysPlayed: 0,
                lastPlayedDate: null
            });
        }

        // 약점 문제 초기화
        if (!this.load(this.KEYS.WEAK_QUESTIONS)) {
            this.save(this.KEYS.WEAK_QUESTIONS, []);
        }

        // 최고 점수 초기화
        if (!this.load(this.KEYS.HIGH_SCORES)) {
            this.save(this.KEYS.HIGH_SCORES, {
                daily: { highestRating: 0, date: null },
                timeAttack: { score: 0, date: null },
                perfect: { score: 0, date: null }
            });
        }

        // 설정 초기화
        if (!this.load(this.KEYS.SETTINGS)) {
            this.save(this.KEYS.SETTINGS, {
                sound: true,
                vibration: true,
                theme: 'light',
                playerName: '',
                preferredTimeMode: 30,
                childAge: 7
            });
        }

        // 단계별학습 최단시간 기록 초기화
        if (!this.load(this.KEYS.STEP_RECORDS)) {
            this.save(this.KEYS.STEP_RECORDS, {});
        }

        // 연습 모드 통계 초기화
        if (!this.load(this.KEYS.PRACTICE_STATS)) {
            this.save(this.KEYS.PRACTICE_STATS, {
                totalQuestions: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                totalTime: 0
            });
        }
    }

    // 데이터 저장
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    // 데이터 로드
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    }

    // 레이팅 저장
    saveRating(rating, rank) {
        const data = this.load(this.KEYS.RATING);
        data.previousRank = data.currentRank;
        data.currentRating = rating;
        data.currentRank = rank;
        if (rating > data.highestRating) {
            data.highestRating = rating;
        }
        this.save(this.KEYS.RATING, data);
    }

    // 레이팅 가져오기
    getRating() {
        return this.load(this.KEYS.RATING);
    }

    // 매일 기록 저장
    saveDailyRecord(record) {
        const records = this.load(this.KEYS.DAILY_RECORDS);
        records.push(record);
        // 최근 30일만 유지
        if (records.length > 30) {
            records.shift();
        }
        this.save(this.KEYS.DAILY_RECORDS, records);
    }

    // 매일 기록 가져오기
    getDailyRecords(days = 7) {
        const records = this.load(this.KEYS.DAILY_RECORDS);
        return records.slice(-days);
    }

    // 통계 업데이트
    updateStatistics(gameResult) {
        const stats = this.load(this.KEYS.STATISTICS);

        stats.totalGamesPlayed++;
        if (gameResult.timeMode === 30) {
            stats.gamesBy30sec++;
        } else {
            stats.gamesBy60sec++;
        }

        stats.totalQuestionsAnswered += gameResult.totalCount;
        stats.totalCorrect += gameResult.correctCount;
        stats.totalIncorrect += gameResult.incorrectCount;
        stats.totalScore += gameResult.score;

        if (stats.totalQuestionsAnswered > 0) {
            stats.overallCorrectRate = stats.totalCorrect / stats.totalQuestionsAnswered;
        }

        this.save(this.KEYS.STATISTICS, stats);
    }

    // 통계 가져오기
    getStatistics() {
        return this.load(this.KEYS.STATISTICS);
    }

    // 문제별 기록 저장
    saveQuestionRecord(question, isCorrect) {
        const mastery = this.load(this.KEYS.QUESTION_MASTERY);
        const key = question;

        if (mastery[key]) {
            if (isCorrect) {
                mastery[key].correct++;
                mastery[key].streak++;
                if (mastery[key].streak >= 3) {
                    mastery[key].conquered = true;
                }
            } else {
                mastery[key].incorrect++;
                mastery[key].streak = 0;
                mastery[key].conquered = false;
            }
            mastery[key].lastPracticed = new Date().toISOString();
            this.save(this.KEYS.QUESTION_MASTERY, mastery);
        }
    }

    // 문제별 숙달도 가져오기
    getQuestionMastery() {
        return this.load(this.KEYS.QUESTION_MASTERY);
    }

    // 단계별 학습 진행 업데이트
    updateStepProgress(step, correct, total) {
        const progress = this.load(this.KEYS.STEP_PROGRESS);

        if (!progress.stepScores[step]) return;

        progress.stepScores[step].attempts += total;
        progress.stepScores[step].correct += correct;
        progress.stepScores[step].correctRate =
            progress.stepScores[step].correct / progress.stepScores[step].attempts;

        // 80% 이상이면 완료
        if (progress.stepScores[step].correctRate >= 0.8 &&
            progress.stepScores[step].attempts >= 10) {
            progress.stepScores[step].completed = true;
            if (!progress.completedSteps.includes(step)) {
                progress.completedSteps.push(step);
            }

            // 다음 단 언락
            const nextStepIndex = progress.stepOrder.indexOf(step) + 1;
            if (nextStepIndex < progress.stepOrder.length) {
                const nextStep = progress.stepOrder[nextStepIndex];
                progress.stepScores[nextStep].unlocked = true;
                progress.currentStep = nextStep;
            }
        }

        this.save(this.KEYS.STEP_PROGRESS, progress);
    }

    // 단계별 학습 진행 가져오기
    getStepProgress() {
        return this.load(this.KEYS.STEP_PROGRESS);
    }

    // 연속 플레이 체크 및 업데이트
    checkStreak() {
        const streak = this.load(this.KEYS.PLAY_STREAK);
        const today = new Date().toISOString().split('T')[0];

        if (!streak.lastPlayedDate) {
            // 첫 플레이
            streak.currentStreak = 1;
            streak.totalDaysPlayed = 1;
            streak.lastPlayedDate = today;
        } else {
            const lastDate = new Date(streak.lastPlayedDate);
            const currentDate = new Date(today);
            const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // 오늘 이미 플레이함
                return;
            } else if (diffDays === 1) {
                // 연속 플레이
                streak.currentStreak++;
                streak.totalDaysPlayed++;
                streak.lastPlayedDate = today;
                if (streak.currentStreak > streak.longestStreak) {
                    streak.longestStreak = streak.currentStreak;
                }
            } else {
                // 연속 끊김
                streak.currentStreak = 1;
                streak.totalDaysPlayed++;
                streak.lastPlayedDate = today;
            }
        }

        this.save(this.KEYS.PLAY_STREAK, streak);
    }

    // 연속 플레이 가져오기
    getPlayStreak() {
        return this.load(this.KEYS.PLAY_STREAK);
    }

    // 약점 문제 업데이트
    updateWeakQuestions() {
        const mastery = this.load(this.KEYS.QUESTION_MASTERY);
        const weak = [];

        for (const [question, data] of Object.entries(mastery)) {
            const total = data.correct + data.incorrect;
            if (total >= 3) {
                const incorrectRate = data.incorrect / total;
                if (incorrectRate >= 0.3 && !data.conquered) {
                    weak.push({
                        question,
                        priority: incorrectRate,
                        incorrectRate
                    });
                }
            }
        }

        weak.sort((a, b) => b.priority - a.priority);
        this.save(this.KEYS.WEAK_QUESTIONS, weak);
        return weak;
    }

    // 약점 문제 가져오기
    getWeakQuestions() {
        return this.load(this.KEYS.WEAK_QUESTIONS);
    }

    // 최고 점수 저장
    saveHighScore(mode, score, date) {
        const highScores = this.load(this.KEYS.HIGH_SCORES);

        if (mode === 'daily') {
            if (score > highScores.daily.highestRating) {
                highScores.daily.highestRating = score;
                highScores.daily.date = date;
            }
        } else {
            if (score > highScores[mode].score) {
                highScores[mode].score = score;
                highScores[mode].date = date;
            }
        }

        this.save(this.KEYS.HIGH_SCORES, highScores);
    }

    // 최고 점수 가져오기
    getHighScores() {
        return this.load(this.KEYS.HIGH_SCORES);
    }

    // 설정 저장
    saveSetting(key, value) {
        const settings = this.load(this.KEYS.SETTINGS);
        settings[key] = value;
        this.save(this.KEYS.SETTINGS, settings);
    }

    // 설정 가져오기
    getSettings() {
        return this.load(this.KEYS.SETTINGS);
    }

    // 모든 데이터 내보내기
    exportAllData() {
        const data = {};
        for (const [name, key] of Object.entries(this.KEYS)) {
            data[name] = this.load(key);
        }
        return data;
    }

    // 모든 데이터 가져오기 (복원)
    restoreAllData(data) {
        for (const [name, value] of Object.entries(data)) {
            if (this.KEYS[name]) {
                this.save(this.KEYS[name], value);
            }
        }
    }

    // 모든 데이터 초기화
    resetAllData() {
        for (const key of Object.values(this.KEYS)) {
            localStorage.removeItem(key);
        }
        this.initializeData();
    }

    // 단계별학습 최단시간 기록 저장
    saveStepByStepRecord(table, time) {
        const records = this.load(this.KEYS.STEP_RECORDS);
        const currentBest = records[table];

        if (!currentBest || time < currentBest) {
            records[table] = time;
            this.save(this.KEYS.STEP_RECORDS, records);
            return true; // 신기록
        }
        return false; // 기존 기록 유지
    }

    // 단계별학습 최단시간 기록 가져오기
    getStepByStepRecords() {
        return this.load(this.KEYS.STEP_RECORDS);
    }

    // 연습 모드 기록 저장
    savePracticeRecord(isCorrect, elapsedTime) {
        const stats = this.load(this.KEYS.PRACTICE_STATS);
        stats.totalQuestions++;
        if (isCorrect) {
            stats.correctAnswers++;
        } else {
            stats.incorrectAnswers++;
        }
        stats.totalTime += elapsedTime;
        this.save(this.KEYS.PRACTICE_STATS, stats);
    }

    // 연습 모드 통계 가져오기
    getPracticeStats() {
        return this.load(this.KEYS.PRACTICE_STATS);
    }
}

// 전역 인스턴스
const storage = new StorageManager();
