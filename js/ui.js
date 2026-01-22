// UI 관리 클래스
class UIManager {
    constructor() {
        this.currentScreen = 'main-menu';
    }

    // 화면 전환
    showScreen(screenId) {
        // 모든 화면 숨기기
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // 선택한 화면 표시
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    // 피드백 오버레이 표시
    showFeedback(message, type = 'correct') {
        const overlay = document.getElementById('feedback-overlay');
        const messageEl = document.getElementById('feedback-message');

        messageEl.textContent = message;
        messageEl.className = `feedback-message ${type}`;
        overlay.classList.add('active');

        // 진동 피드백
        if (navigator.vibrate && storage.getSettings().vibration) {
            if (type === 'correct') {
                navigator.vibrate(50);
            } else {
                navigator.vibrate([50, 50, 50]);
            }
        }

        // 소리 피드백
        if (storage.getSettings().sound) {
            const audio = new Audio();
            if (type === 'correct') {
                audio.src = 'assets/sounds/correct.mp3';
            } else {
                audio.src = 'assets/sounds/incorrect.mp3';
            }
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Audio play failed:', err));
        }

        // 0.5초 후 자동 숨김
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 500);
    }

    // 로딩 표시
    showLoading() {
        // TODO: 로딩 스피너 구현
    }

    hideLoading() {
        // TODO: 로딩 스피너 숨김
    }

    // 모달 표시
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    // 모달 숨김
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // 메인 메뉴 UI 업데이트
    updateMainMenu() {
        const rating = storage.getRating();
        const stats = storage.getStatistics();
        const streak = storage.getPlayStreak();

        // 레이팅 표시
        document.getElementById('current-rating').textContent = `${rating.highestRating}점`;

        // 순위 표시
        document.getElementById('current-rank').textContent = `${rating.currentRank}위/100명`;

        // 거리 표시
        const distance = statisticsManager.formatDistance(stats.totalScore);
        document.getElementById('current-distance').textContent = distance;

        // 연속 플레이 표시
        document.getElementById('play-streak').textContent = streak.currentStreak;

        // 단계별 학습 진행 상황
        const stepProgress = storage.getStepProgress();
        document.getElementById('step-progress').textContent = `${stepProgress.currentStep}단 진행중`;

        // 약점 문제 수
        const weakQuestions = storage.getWeakQuestions();
        document.getElementById('weakness-count').textContent = `${weakQuestions.length}개 문제`;
    }

    // 범위 선택 그리드 생성
    createRangeGrid(timeMode) {
        const grid = document.getElementById('range-grid');
        grid.innerHTML = '';

        const lockStatus = ratingSystem.getTableLockStatus();

        for (let table = 2; table <= 9; table++) {
            const btn = document.createElement('button');
            btn.className = 'range-btn';

            const status = lockStatus[table];

            if (status.unlocked) {
                btn.classList.add('unlocked');
                btn.onclick = () => app.startDailyTest(timeMode, table);
            } else {
                btn.classList.add('locked');
                btn.disabled = true;
            }

            // 현재 도전 중인 범위 표시
            if (status.progress > 0 && status.progress < status.threshold) {
                btn.classList.add('current');
            }

            const title = document.createElement('div');
            title.className = 'range-title';
            title.textContent = `${table}단까지`;

            const score = document.createElement('div');
            score.className = 'range-score';
            const maxScore = ratingSystem.getScoreByTable(table, timeMode);
            score.textContent = `최대 ${maxScore}점`;

            const statusIcon = document.createElement('div');
            statusIcon.className = 'range-status';
            if (status.unlocked) {
                statusIcon.textContent = '✓';
            } else {
                statusIcon.textContent = '🔒';
            }

            const progress = document.createElement('div');
            progress.className = 'range-progress';
            progress.textContent = `${status.progress}% / ${status.threshold}%`;

            btn.appendChild(title);
            btn.appendChild(score);
            btn.appendChild(statusIcon);
            btn.appendChild(progress);

            grid.appendChild(btn);
        }
    }

    // 랭킹 리스트 생성
    createRankingList() {
        const list = document.getElementById('ranking-list');
        list.innerHTML = '';

        const rating = storage.getRating();
        const { allPlayers } = ratingSystem.getRanking(rating.highestRating);

        // 상위 10명 + 내 주변 5명 + 하위 3명
        let displayPlayers = [];

        // 상위 10명
        displayPlayers.push(...allPlayers.slice(0, 10));

        // 내 위치 찾기
        const myIndex = allPlayers.findIndex(p => p.isPlayer);

        // 내 주변 5명 (중복 제거)
        if (myIndex > 10) {
            for (let i = Math.max(10, myIndex - 2); i <= Math.min(allPlayers.length - 1, myIndex + 2); i++) {
                if (!displayPlayers.some(p => p.name === allPlayers[i].name)) {
                    displayPlayers.push(allPlayers[i]);
                }
            }
        }

        // 하위 3명 (중복 제거)
        const bottom = allPlayers.slice(-3);
        bottom.forEach(p => {
            if (!displayPlayers.some(dp => dp.name === p.name)) {
                displayPlayers.push(p);
            }
        });

        // 순위 순으로 정렬
        displayPlayers.sort((a, b) => {
            const aIndex = allPlayers.findIndex(p => p.name === a.name);
            const bIndex = allPlayers.findIndex(p => p.name === b.name);
            return aIndex - bIndex;
        });

        // 리스트 생성
        displayPlayers.forEach(player => {
            const rank = allPlayers.findIndex(p => p.name === player.name) + 1;
            const item = document.createElement('div');
            item.className = 'ranking-item';

            if (player.isPlayer) {
                item.classList.add('player');
            }

            const medal = document.createElement('div');
            medal.className = 'rank-medal';
            if (rank <= 3) {
                medal.textContent = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
            } else {
                medal.textContent = '';
            }

            const number = document.createElement('div');
            number.className = 'rank-number';
            number.textContent = `${rank}위`;

            const name = document.createElement('div');
            name.className = 'rank-name';
            name.textContent = player.isPlayer ? '😛 ' + player.name : player.name;

            const ratingEl = document.createElement('div');
            ratingEl.className = 'rank-rating';
            ratingEl.textContent = `${player.rating}점`;

            if (medal.textContent) {
                item.appendChild(medal);
            } else {
                item.appendChild(number);
            }
            item.appendChild(name);
            item.appendChild(ratingEl);

            list.appendChild(item);
        });
    }

    // 통계 화면 업데이트
    updateStatistics() {
        const allStats = statisticsManager.getAllStatistics();

        // 레이팅 정보
        document.getElementById('stats-rating').textContent = `${allStats.highestRating}점`;
        document.getElementById('stats-highest').textContent = `${allStats.highestRating}점`;
        document.getElementById('stats-rank').textContent = `${allStats.currentRank}위/100명`;

        // 플레이 기록
        document.getElementById('stats-games').textContent = `${allStats.totalGamesPlayed}회`;
        document.getElementById('stats-30sec').textContent = `${allStats.gamesBy30sec}회`;
        document.getElementById('stats-60sec').textContent = `${allStats.gamesBy60sec}회`;

        // 정답률
        document.getElementById('stats-total').textContent = `${allStats.totalQuestionsAnswered}문제`;
        document.getElementById('stats-correct').textContent = `${allStats.totalCorrect}문제`;
        document.getElementById('stats-rate').textContent = `${Math.round(allStats.overallCorrectRate * 100)}%`;

        // 누적 거리
        document.getElementById('stats-distance').textContent = statisticsManager.formatDistance(allStats.distance);
        document.getElementById('stats-landmark').textContent =
            `${allStats.currentLandmark.emoji} ${allStats.currentLandmark.name} 통과!`;
        document.getElementById('stats-next').textContent =
            `다음 목표: ${allStats.nextLandmark.name}`;
        document.getElementById('stats-progress').style.width = `${allStats.progress * 100}%`;

        // 단별 정답률
        const tableStatsDiv = document.getElementById('table-stats');
        tableStatsDiv.innerHTML = '';

        for (let table = 2; table <= 9; table++) {
            const stat = allStats.tableStats[table];
            const row = document.createElement('div');
            row.className = 'table-stat-row';

            const label = document.createElement('div');
            label.className = 'table-label';
            label.textContent = `${table}단:`;

            const bar = document.createElement('div');
            bar.className = 'table-bar';

            const fill = document.createElement('div');
            fill.className = 'table-bar-fill';
            fill.style.width = `${stat.rate * 100}%`;

            bar.appendChild(fill);

            const rate = document.createElement('div');
            rate.className = 'table-rate';
            if (stat.total === 0) {
                rate.textContent = '-';
            } else {
                rate.textContent = `${Math.round(stat.rate * 100)}%`;
            }

            row.appendChild(label);
            row.appendChild(bar);
            row.appendChild(rate);

            tableStatsDiv.appendChild(row);
        }
    }

    // 설정 화면 로드
    loadSettings() {
        const settings = storage.getSettings();

        document.getElementById('setting-sound').checked = settings.sound;
        document.getElementById('setting-vibration').checked = settings.vibration;
        document.getElementById('setting-age').value = settings.childAge;
        document.getElementById('setting-time-mode').value = settings.preferredTimeMode;
    }

    // 자유연습 단 선택 그리드 생성
    createPracticeGrid() {
        const grid = document.getElementById('practice-range-grid');
        grid.innerHTML = '';

        for (let i = 2; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'range-btn';
            btn.innerHTML = `<div class="range-btn-title">${i}단</div>`;
            btn.onclick = () => {
                practiceMode.startPractice(i);
                this.showScreen('game-screen');
            };
            grid.appendChild(btn);
        }
    }

    // 자유연습 UI 업데이트
    updatePracticeUI(questionsAnswered, correctAnswers, incorrectAnswers) {
        const progressDiv = document.getElementById('game-info');
        if (!progressDiv) return;

        const correctRate = questionsAnswered > 0
            ? ((correctAnswers / questionsAnswered) * 100).toFixed(1)
            : 0;

        progressDiv.innerHTML = `
            <div class="game-progress">
                <div class="game-progress-text">푼 문제: ${questionsAnswered}</div>
                <div class="game-progress-text">정답: ${correctAnswers} (${correctRate}%)</div>
            </div>
        `;
    }

    // 자유연습 결과 화면
    showPracticeResult(result) {
        document.getElementById('practice-questions').textContent = result.questionsAnswered;
        document.getElementById('practice-correct').textContent = result.correctAnswers;
        document.getElementById('practice-rate').textContent = result.correctRate + '%';

        const minutes = Math.floor(result.totalTime / 60000);
        const seconds = Math.floor((result.totalTime % 60000) / 1000);
        document.getElementById('practice-time').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.showScreen('practice-result');
    }

    // 단계별학습 단 선택 그리드 생성
    createStepByStepGrid() {
        const grid = document.getElementById('step-grid');
        grid.innerHTML = '';

        const records = stepByStepMode.getTableRecords();

        for (let i = 2; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'step-btn';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'step-btn-title';
            titleDiv.textContent = `${i}단`;

            const recordDiv = document.createElement('div');
            recordDiv.className = 'step-btn-record';

            if (records[i]) {
                const time = StepByStepMode.formatTime(records[i]);
                recordDiv.textContent = `최단: ${time}`;
                recordDiv.classList.add('has-record');
            } else {
                recordDiv.textContent = '기록 없음';
            }

            btn.appendChild(titleDiv);
            btn.appendChild(recordDiv);

            btn.onclick = () => {
                stepByStepMode.startStep(i);
                this.showScreen('game-screen');
            };

            grid.appendChild(btn);
        }
    }

    // 단계별학습 UI 업데이트 (게임 중)
    updateStepByStepUI(questionsCount, maxQuestions, elapsedTime) {
        const progressDiv = document.getElementById('game-info');
        if (!progressDiv) return;

        const remaining = maxQuestions - questionsCount;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        progressDiv.innerHTML = `
            <div class="game-progress">
                <div class="game-progress-text">진행: ${questionsCount} / ${maxQuestions} (남은 문제: ${remaining}개)</div>
                <div class="game-elapsed-time">경과 시간: ${timeStr}</div>
            </div>
        `;
    }

    // 단계별학습 결과 화면
    showStepResult(result) {
        document.getElementById('step-correct').textContent =
            `${result.correctAnswers} / ${result.totalQuestions}`;

        const time = StepByStepMode.formatTime(result.elapsedTime);
        document.getElementById('step-time').textContent = time;

        // 메달 표시 (만점일 때만)
        const medalElement = document.getElementById('step-medal');
        if (result.isPerfect) {
            const timeInSeconds = Math.floor(result.elapsedTime / 1000);
            let medal = '';
            if (timeInSeconds <= 15) {
                medal = '🥇'; // 금메달: 15초 이하
            } else if (timeInSeconds <= 25) {
                medal = '🥈'; // 은메달: 25초 이하
            } else if (timeInSeconds <= 40) {
                medal = '🥉'; // 동메달: 40초 이하
            }
            medalElement.textContent = medal;
        } else {
            medalElement.textContent = '';
        }

        const recordInfoDiv = document.getElementById('step-record-info');
        recordInfoDiv.innerHTML = '';

        if (result.isPerfect) {
            const perfectDiv = document.createElement('div');
            perfectDiv.className = 'step-record-perfect';
            perfectDiv.textContent = '🎉 만점 달성!';
            recordInfoDiv.appendChild(perfectDiv);

            if (result.isNewRecord) {
                const newRecordDiv = document.createElement('div');
                newRecordDiv.className = 'step-record-new';
                newRecordDiv.textContent = '⭐ 신기록 달성!';
                recordInfoDiv.appendChild(newRecordDiv);
            } else if (result.bestTime) {
                const bestDiv = document.createElement('div');
                bestDiv.className = 'step-record-best';
                bestDiv.textContent = `최단 기록: ${StepByStepMode.formatTime(result.bestTime)}`;
                recordInfoDiv.appendChild(bestDiv);
            }
        } else {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'step-record-message';
            messageDiv.textContent = '만점을 달성하면 최단시간이 기록됩니다!';
            recordInfoDiv.appendChild(messageDiv);
        }

        this.showScreen('step-result');
    }
}

// 전역 인스턴스
const ui = new UIManager();
