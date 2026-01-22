const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - 파일을 찾을 수 없습니다</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('서버 오류: ' + error.code, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ 테스트 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
  console.log('');
  console.log('🎮 제하의 구구단왕 게임을 테스트해보세요!');
  console.log('');
  console.log('📱 PWA 테스트:');
  console.log('   1. 브라우저에서 http://localhost:3000 접속');
  console.log('   2. 개발자 도구 > Application > Manifest 확인');
  console.log('   3. 개발자 도구 > Application > Service Workers 확인');
  console.log('   4. 주소창 오른쪽에 설치 아이콘(+) 클릭하여 앱 설치');
  console.log('');
  console.log('종료하려면 Ctrl+C를 누르세요');
});
