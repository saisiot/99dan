// 자유 연습 모드 - 무한 연습, 레이팅 미적용
class PracticeMode {
    constructor() {
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.startTime = null;
        this.currentTable = null;
        this.questionStartTime = null;
    }

    // 자유연습 시작
    startPractice(table) {
        this.currentTable = table;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.startTime = Date.now();

        // GameEngine 시작 (무한모드, 레이팅 미적용)
        game.startGame('practice', null, table);
        this.updatePracticeUI();
    }

    // 문제 시작 시간 기록
    startQuestion() {
        this.questionStartTime = Date.now();
    }

    // 정답 제출
    submitAnswer(isCorrect, correctAnswer) {
        this.questionsAnswered++;

        if (isCorrect) {
            this.correctAnswers++;
            // 정답 피드백
            ui.showFeedback('정답! ✓', 'correct');
        } else {
            this.incorrectAnswers++;
            // 오답 피드백
            ui.showFeedback(`오답! 정답은 ${correctAnswer}`, 'incorrect');
        }

        // 문제별 소요 시간 계산
        const questionTime = this.questionStartTime ? Date.now() - this.questionStartTime : 0;

        // 통계에만 기록 (레이팅 제외)
        storage.savePracticeRecord(isCorrect, questionTime);

        // UI 업데이트
        this.updatePracticeUI();

        // 다음 문제로
        setTimeout(() => {
            game.nextQuestion();
            this.startQuestion();
        }, 500);
    }

    // UI 업데이트
    updatePracticeUI() {
        ui.updatePracticeUI(
            this.questionsAnswered,
            this.correctAnswers,
            this.incorrectAnswers
        );
    }

    // 연습 종료
    quitPractice() {
        const totalTime = Date.now() - this.startTime;
        const correctRate = this.questionsAnswered > 0
            ? (this.correctAnswers / this.questionsAnswered * 100).toFixed(1)
            : 0;

        // 결과 화면 표시
        ui.showPracticeResult({
            questionsAnswered: this.questionsAnswered,
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            correctRate: correctRate,
            totalTime: totalTime,
            table: this.currentTable
        });
    }

    // 현재 상태 가져오기
    getState() {
        return {
            questionsAnswered: this.questionsAnswered,
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            currentTable: this.currentTable
        };
    }
}

// 전역 인스턴스
const practiceMode = new PracticeMode();
