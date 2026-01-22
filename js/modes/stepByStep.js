// 단계별 학습 모드 - 20문제 고정, 만점 최단시간 기록
class StepByStepMode {
    constructor() {
        this.currentTable = null;
        this.questionsCount = 0;
        this.maxQuestions = 20;
        this.correctAnswers = 0;
        this.startTime = null;
        this.records = storage.getStepByStepRecords();
    }

    // 단계별학습 시작
    startStep(table) {
        this.currentTable = table;
        this.questionsCount = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();

        // GameEngine 시작 (20문제 모드)
        game.startGame('stepByStep', null, table);
        this.updateStepUI();
    }

    // 정답 제출
    submitAnswer(isCorrect, correctAnswer) {
        this.questionsCount++;

        if (isCorrect) {
            this.correctAnswers++;
            // 정답 피드백
            ui.showFeedback('정답! ✓', 'correct');
        } else {
            // 오답 피드백
            ui.showFeedback(`오답! 정답은 ${correctAnswer}`, 'incorrect');
        }

        // UI 업데이트
        this.updateStepUI();

        // 20문제 완료 확인
        if (this.questionsCount >= this.maxQuestions) {
            setTimeout(() => {
                this.finishStep();
            }, 500);
        } else {
            // 다음 문제로
            setTimeout(() => {
                game.nextQuestion();
            }, 500);
        }
    }

    // UI 업데이트
    updateStepUI() {
        const elapsedTime = Date.now() - this.startTime;
        ui.updateStepByStepUI(
            this.questionsCount,
            this.maxQuestions,
            elapsedTime
        );
    }

    // 단계 완료
    finishStep() {
        const elapsedTime = Date.now() - this.startTime;
        const isPerfect = this.correctAnswers === this.maxQuestions;
        let isNewRecord = false;

        if (isPerfect) {
            // 만점인 경우에만 최단시간 갱신 체크
            isNewRecord = storage.saveStepByStepRecord(this.currentTable, elapsedTime);

            // 기록 갱신
            this.records = storage.getStepByStepRecords();
        }

        // 결과 화면 표시
        ui.showStepResult({
            table: this.currentTable,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.maxQuestions,
            elapsedTime: elapsedTime,
            isPerfect: isPerfect,
            isNewRecord: isNewRecord,
            bestTime: this.records[this.currentTable] || null
        });
    }

    // 각 단의 최단시간 기록 반환
    getTableRecords() {
        return this.records;
    }

    // 기록 새로고침
    refreshRecords() {
        this.records = storage.getStepByStepRecords();
        return this.records;
    }

    // 시간을 MM:SS 포맷으로 변환
    static formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 현재 상태 가져오기
    getState() {
        return {
            currentTable: this.currentTable,
            questionsCount: this.questionsCount,
            maxQuestions: this.maxQuestions,
            correctAnswers: this.correctAnswers,
            startTime: this.startTime
        };
    }
}

// 전역 인스턴스
const stepByStepMode = new StepByStepMode();
