// 게임 엔진 클래스
class GameEngine {
    constructor() {
        this.currentMode = null;
        this.timeMode = 60; // 30 or 60
        this.maxTable = 2;
        this.timer = null;
        this.timeLeft = 60;
        this.score = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.currentQuestion = null;
        this.currentAnswer = '';
        this.questions = [];
        this.startTime = null;
    }

    // 문제 생성 (범위 내 랜덤)
    generateQuestion(minTable = 2, maxTable = 9) {
        // 단계별 학습 모드: 특정 단만 출제
        let multiplicand;
        if (this.currentMode === 'stepByStep') {
            multiplicand = this.maxTable; // 선택한 단만
        } else {
            multiplicand = Math.floor(Math.random() * (maxTable - minTable + 1)) + minTable;
        }

        const multiplier = Math.floor(Math.random() * 8) + 2; // 2~9

        return {
            multiplicand,
            multiplier,
            answer: multiplicand * multiplier,
            timestamp: Date.now()
        };
    }

    // 게임 시작
    startGame(mode, timeMode, maxTable) {
        this.currentMode = mode;
        this.timeMode = timeMode;
        this.maxTable = maxTable;
        this.timeLeft = timeMode;
        this.score = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.currentAnswer = '';
        this.questions = [];
        this.startTime = Date.now();

        // 첫 문제 생성 (단계별 학습은 중복 없이)
        if (mode === 'stepByStep') {
            this.nextQuestionUnique();
        } else {
            this.nextQuestion();
        }

        // 타이머 시작 (자유연습과 단계별학습은 타이머 없음)
        if (mode !== 'practice' && mode !== 'stepByStep') {
            this.startTimer();
        }

        // 자유연습 모드: 문제 시작 시간 기록
        if (mode === 'practice') {
            practiceMode.startQuestion();
        }

        // UI 업데이트
        this.updateUI();
    }

    // 타이머 시작
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    // 타이머 중지
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 다음 문제
    nextQuestion() {
        this.currentQuestion = this.generateQuestion(2, this.maxTable);
        this.currentAnswer = '';
        this.questions.push(this.currentQuestion);

        // UI 업데이트
        document.getElementById('multiplicand').textContent = this.currentQuestion.multiplicand;
        document.getElementById('multiplier').textContent = this.currentQuestion.multiplier;
        document.getElementById('answer-field').value = '';
    }

    // 다음 문제 (중복 없음 - 단계별 학습용)
    nextQuestionUnique() {
        if (this.currentMode !== 'stepByStep') {
            this.nextQuestion();
            return;
        }

        // 사용 가능한 곱하는 수 목록 (2~9)
        const availableMultipliers = [];
        for (let i = 2; i <= 9; i++) {
            if (!stepByStepMode.usedMultipliers.has(i)) {
                availableMultipliers.push(i);
            }
        }

        // 사용 가능한 숫자가 있으면 랜덤 선택
        if (availableMultipliers.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMultipliers.length);
            const multiplier = availableMultipliers[randomIndex];
            stepByStepMode.usedMultipliers.add(multiplier);

            this.currentQuestion = {
                multiplicand: this.maxTable,
                multiplier: multiplier,
                answer: this.maxTable * multiplier,
                timestamp: Date.now()
            };
        } else {
            // 모두 사용했으면 일반 방식
            this.currentQuestion = this.generateQuestion(2, this.maxTable);
        }

        this.currentAnswer = '';
        this.questions.push(this.currentQuestion);

        // UI 업데이트
        document.getElementById('multiplicand').textContent = this.currentQuestion.multiplicand;
        document.getElementById('multiplier').textContent = this.currentQuestion.multiplier;
        document.getElementById('answer-field').value = '';
    }

    // 숫자 입력
    inputNumber(num) {
        if (this.currentAnswer.length < 3) {
            this.currentAnswer += num;
            document.getElementById('answer-field').value = this.currentAnswer;

            // 진동 피드백
            if (navigator.vibrate && storage.getSettings().vibration) {
                navigator.vibrate(10);
            }
        }
    }

    // 숫자 지우기
    deleteNumber() {
        this.currentAnswer = this.currentAnswer.slice(0, -1);
        document.getElementById('answer-field').value = this.currentAnswer;
    }

    // 정답 제출
    submitAnswer() {
        if (!this.currentAnswer) return;

        const userAnswer = parseInt(this.currentAnswer);
        const isCorrect = userAnswer === this.currentQuestion.answer;
        const responseTime = Date.now() - this.currentQuestion.timestamp;

        // 모드별 처리
        if (this.currentMode === 'practice') {
            // 자유연습 모드: 레이팅 미적용
            practiceMode.submitAnswer(isCorrect, this.currentQuestion.answer);
            this.currentAnswer = '';
            return;
        }

        if (this.currentMode === 'stepByStep') {
            // 단계별학습 모드: 20문제 제한
            stepByStepMode.submitAnswer(isCorrect, this.currentQuestion.answer);
            this.currentAnswer = '';
            return;
        }

        // 기본 모드 (오늘의 테스트 등) 정답 처리
        if (isCorrect) {
            this.correctCount++;
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }

            // 점수 계산 (단수별 차등)
            const baseScore = ratingSystem.getScoreByTable(
                this.currentQuestion.multiplicand,
                this.timeMode
            );
            this.score += baseScore;

            // 문제별 기록 저장
            storage.saveQuestionRecord(
                `${this.currentQuestion.multiplicand}x${this.currentQuestion.multiplier}`,
                true
            );

            // 피드백 표시
            ui.showFeedback('정답! ✓', 'correct');
        } else {
            this.incorrectCount++;
            this.combo = 0;

            // 문제별 기록 저장
            storage.saveQuestionRecord(
                `${this.currentQuestion.multiplicand}x${this.currentQuestion.multiplier}`,
                false
            );

            // 피드백 표시 (정답 포함)
            ui.showFeedback(
                `오답! 정답은 ${this.currentQuestion.answer}`,
                'incorrect'
            );
        }

        // 다음 문제
        this.nextQuestion();
        this.updateUI();
    }

    // UI 업데이트
    updateUI() {
        document.getElementById('game-timer').textContent = this.timeLeft;
        document.getElementById('game-score').textContent = this.score;
        document.getElementById('game-combo').textContent = this.combo;
    }

    // 게임 종료
    endGame() {
        this.stopTimer();

        const totalCount = this.correctCount + this.incorrectCount;
        const correctRate = totalCount > 0 ? this.correctCount / totalCount : 0;

        // 레이팅 계산
        const rating = ratingSystem.calculateRating(this.score, this.timeMode, this.maxTable);
        const { myRank } = ratingSystem.getRanking(rating);

        // 레이팅 저장
        storage.saveRating(rating, myRank);

        // 통계 업데이트
        storage.updateStatistics({
            timeMode: this.timeMode,
            score: this.score,
            correctCount: this.correctCount,
            incorrectCount: this.incorrectCount,
            totalCount: totalCount,
            correctRate: correctRate
        });

        // 매일 기록 저장
        storage.saveDailyRecord({
            date: new Date().toISOString().split('T')[0],
            timeMode: this.timeMode,
            rating: rating,
            score: this.score,
            maxTable: this.maxTable,
            correctCount: this.correctCount,
            totalCount: totalCount,
            correctRate: correctRate,
            rank: myRank,
            cumulativeDistance: storage.getStatistics().totalScore
        });

        // 연속 플레이 체크
        storage.checkStreak();

        // 랜드마크 정보 업데이트
        statisticsManager.updateLandmarkInfo();

        // 약점 문제 업데이트
        weaknessAnalyzer.updateWeakQuestions();

        // 잠금 해제 체크
        const lockStatus = ratingSystem.getTableLockStatus();
        let unlockedTable = null;
        for (let table = 3; table <= 9; table++) {
            if (lockStatus[table].unlocked && !lockStatus[table - 1].unlocked) {
                unlockedTable = table;
                break;
            }
        }

        // 결과 화면 표시
        app.showResult({
            rating,
            myRank,
            score: this.score,
            correctCount: this.correctCount,
            incorrectCount: this.incorrectCount,
            correctRate: correctRate,
            maxCombo: this.maxCombo,
            unlockedTable
        });
    }

    // 게임 포기
    quitGame() {
        if (confirm('정말 포기하시겠습니까?')) {
            this.stopTimer();

            // 모드별 처리
            if (this.currentMode === 'practice') {
                practiceMode.quitPractice();
            } else if (this.currentMode === 'stepByStep') {
                // 단계별학습은 중도 포기 시 메인 메뉴로
                app.showMainMenu();
            } else {
                app.showMainMenu();
            }
        }
    }
}

// 전역 인스턴스
const game = new GameEngine();
