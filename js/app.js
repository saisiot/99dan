// 앱 메인 컨트롤러
class App {
    constructor() {
        this.selectedTimeMode = 30;
    }

    // 앱 초기화
    init() {
        console.log('제하의 구구단왕 초기화...');

        // 메인 메뉴 표시
        this.showMainMenu();

        // 설정 로드
        ui.loadSettings();
    }

    // 메인 메뉴 표시
    showMainMenu() {
        ui.showScreen('main-menu');
        ui.updateMainMenu();
    }

    // 시간 모드 선택 화면
    showTimeModeSelect() {
        ui.showScreen('time-mode-select');
    }

    // 시간 모드 선택
    selectTimeMode(timeMode) {
        this.selectedTimeMode = timeMode;
        document.getElementById('selected-time-mode').textContent = timeMode;
        ui.showScreen('range-select');
        ui.createRangeGrid(timeMode);
    }

    // 오늘의 테스트 시작
    startDailyTest(timeMode, maxTable) {
        ui.showScreen('game-screen');
        game.startGame('daily', timeMode, maxTable);
    }

    // 결과 화면 표시
    showResult(result) {
        ui.showScreen('result-screen');

        // 레이팅 표시
        document.getElementById('result-rating').textContent = result.rating;

        // 순위 변동 표시
        const ratingChange = ratingSystem.getRankChange();
        const changeEl = document.getElementById('rating-change');
        if (ratingChange > 0) {
            changeEl.textContent = `▲ ${ratingChange}`;
            changeEl.style.color = 'var(--success)';
        } else if (ratingChange < 0) {
            changeEl.textContent = `▼ ${Math.abs(ratingChange)}`;
            changeEl.style.color = 'var(--danger)';
        } else {
            changeEl.textContent = '―';
            changeEl.style.color = 'var(--text-secondary)';
        }

        // 통계 표시
        document.getElementById('result-score').textContent = `${result.score}점`;
        document.getElementById('result-correct').textContent = `${result.correctCount}개`;
        document.getElementById('result-incorrect').textContent = `${result.incorrectCount}개`;
        document.getElementById('result-rate').textContent =
            `${Math.round(result.correctRate * 100)}%`;
        document.getElementById('result-combo').textContent = result.maxCombo;

        // 순위 표시
        document.getElementById('result-rank').textContent = result.myRank;
        const rankIcon = ratingSystem.getRankIcon(result.myRank);
        document.getElementById('rank-icon').textContent = rankIcon;

        // 잠금 해제 메시지
        if (result.unlockedTable) {
            const unlockMsg = document.getElementById('unlock-message');
            document.getElementById('unlock-text').textContent =
                `${result.unlockedTable}단까지 잠금 해제!`;
            unlockMsg.style.display = 'block';
        } else {
            document.getElementById('unlock-message').style.display = 'none';
        }
    }

    // 랭킹 화면 표시
    showRanking() {
        ui.showScreen('ranking-screen');
        ui.createRankingList();
    }

    // 통계 화면 표시
    showStatistics() {
        ui.showScreen('statistics-screen');
        ui.updateStatistics();
    }

    // 설정 화면 표시
    showSettings() {
        ui.showScreen('settings-screen');
        ui.loadSettings();
    }

    // 설정 저장
    saveSetting(key, value) {
        storage.saveSetting(key, value);
        console.log(`설정 저장: ${key} = ${value}`);
    }

    // 데이터 내보내기
    exportData() {
        const code = dataSyncManager.generateSyncCode();

        if (code) {
            document.getElementById('export-code').value = dataSyncManager.formatCode(code);
            ui.showModal('export-modal');
        } else {
            alert('데이터 내보내기 실패!');
        }
    }

    // 내보내기 코드 복사
    async copyExportCode() {
        const code = document.getElementById('export-code').value.replace(/\n/g, '');
        const success = await dataSyncManager.copyCodeToClipboard(code);

        if (success) {
            alert('코드가 클립보드에 복사되었습니다! 📋');
        } else {
            alert('복사 실패. 코드를 직접 선택해서 복사해주세요.');
        }
    }

    // 데이터 가져오기
    importData() {
        ui.showModal('import-modal');
        document.getElementById('import-code').value = '';
    }

    // 데이터 가져오기 실행
    executeImport() {
        const code = document.getElementById('import-code').value.trim().replace(/\n/g, '');

        if (!code) {
            alert('코드를 입력해주세요!');
            return;
        }

        if (confirm('기존 데이터가 덮어씌워집니다. 계속하시겠습니까?')) {
            const result = dataSyncManager.importFromCode(code);

            if (result.success) {
                alert(result.message);
                ui.hideModal('import-modal');
                this.showMainMenu();
                location.reload();
            } else {
                alert(result.message);
            }
        }
    }

    // 데이터 초기화
    resetData() {
        if (confirm('모든 데이터가 삭제됩니다. 정말 초기화하시겠습니까?')) {
            if (confirm('정말로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다!')) {
                storage.resetAllData();
                alert('데이터가 초기화되었습니다.');
                this.showMainMenu();
                location.reload();
            }
        }
    }

    // 모달 닫기
    closeModal(modalId) {
        ui.hideModal(modalId);
    }

    // 단계별 학습
    showStepByStep() {
        ui.createStepByStepGrid();
        ui.showScreen('step-select');
    }

    // 약점 집중 (TODO)
    showWeakness() {
        const weak = storage.getWeakQuestions();
        if (weak.length === 0) {
            alert('약점 문제가 없습니다! 🎉\n모든 문제를 잘 풀고 있어요!');
        } else {
            alert('약점 집중 모드는 준비 중입니다!');
        }
    }

    // 자유 연습
    showPractice() {
        ui.createPracticeGrid();
        ui.showScreen('practice-select');
    }

    // 완벽 도전 (TODO)
    showPerfect() {
        alert('완벽 도전 모드는 준비 중입니다!');
    }
}

// 전역 인스턴스
const app = new App();

// 앱 초기화
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
