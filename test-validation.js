const fs = require('fs');
const path = require('path');

console.log('🔍 제하의 구구단왕 게임 검증 시작...\n');

const requiredFiles = [
  'index.html',
  'manifest.json',
  'service-worker.js',
  'css/style.css',
  'js/landmarks.js',
  'js/virtualPlayers.js',
  'js/storage.js',
  'js/statistics.js',
  'js/rating.js',
  'js/analytics.js',
  'js/dataSync.js',
  'js/game.js',
  'js/ui.js',
  'js/app.js',
  'js/modes/daily.js',
  'js/modes/stepByStep.js',
  'js/modes/weakness.js',
  'js/modes/practice.js',
  'js/modes/perfect.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png'
];

let allFilesExist = true;
let totalSize = 0;

console.log('📁 파일 존재 확인:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);

  if (exists) {
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
    console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ❌ ${file} - 파일이 없습니다!`);
    allFilesExist = false;
  }
});

console.log(`\n📊 총 파일 크기: ${(totalSize / 1024).toFixed(2)} KB\n`);

// manifest.json 검증
console.log('📱 manifest.json 검증:');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
console.log(`  ✅ 앱 이름: ${manifest.name}`);
console.log(`  ✅ 짧은 이름: ${manifest.short_name}`);
console.log(`  ✅ 테마 색상: ${manifest.theme_color}`);
console.log(`  ✅ 아이콘 개수: ${manifest.icons.length}`);

// Service Worker 검증
console.log('\n⚙️ Service Worker 검증:');
const swContent = fs.readFileSync('service-worker.js', 'utf8');
const hasCacheName = swContent.includes('CACHE_NAME');
const hasInstallEvent = swContent.includes("'install'");
const hasFetchEvent = swContent.includes("'fetch'");

console.log(`  ${hasCacheName ? '✅' : '❌'} 캐시 이름 정의`);
console.log(`  ${hasInstallEvent ? '✅' : '❌'} install 이벤트`);
console.log(`  ${hasFetchEvent ? '✅' : '❌'} fetch 이벤트`);

// index.html 검증
console.log('\n🌐 index.html 검증:');
const htmlContent = fs.readFileSync('index.html', 'utf8');
const hasManifest = htmlContent.includes('manifest.json');
const hasServiceWorker = htmlContent.includes('service-worker.js');
const hasGameJS = htmlContent.includes('game.js');

console.log(`  ${hasManifest ? '✅' : '❌'} manifest.json 링크`);
console.log(`  ${hasServiceWorker ? '✅' : '❌'} Service Worker 등록`);
console.log(`  ${hasGameJS ? '✅' : '❌'} game.js 스크립트`);

// 최종 결과
console.log('\n' + '='.repeat(50));
if (allFilesExist && hasCacheName && hasInstallEvent && hasFetchEvent && hasManifest && hasServiceWorker && hasGameJS) {
  console.log('✅ 모든 검증 통과! 게임이 정상적으로 작동할 준비가 되었습니다.');
  console.log('\n🎮 테스트 방법:');
  console.log('   1. http://localhost:3000 접속');
  console.log('   2. 개발자 도구(F12) 열기');
  console.log('   3. Console 탭에서 에러 확인');
  console.log('   4. Application > Manifest 확인');
  console.log('   5. Application > Service Workers 확인');
  console.log('   6. 게임 플레이 테스트');
  console.log('\n📱 PWA 설치:');
  console.log('   - Chrome: 주소창 오른쪽 + 아이콘 클릭');
  console.log('   - Safari (iOS): 공유 > 홈 화면에 추가');
  process.exit(0);
} else {
  console.log('❌ 일부 검증 실패. 위 내용을 확인하세요.');
  process.exit(1);
}
