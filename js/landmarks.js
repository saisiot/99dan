// 랜드마크 데이터 (서울 기준, 90개 이상)
const landmarks = [
    // 근거리 (100m ~ 1km)
    { distance: 100, name: '집 앞 편의점', emoji: '🏪' },
    { distance: 300, name: '동네 공원', emoji: '🌳' },
    { distance: 500, name: '동네 학교', emoji: '🏫' },
    { distance: 800, name: '동네 도서관', emoji: '📚' },
    { distance: 1000, name: '동네 한 바퀴', emoji: '🏃' },

    // 서울 내 (1km ~ 10km)
    { distance: 2000, name: '가까운 지하철역', emoji: '🚇' },
    { distance: 3000, name: '서울 시청', emoji: '🏛️' },
    { distance: 4000, name: '광화문', emoji: '🏯' },
    { distance: 5000, name: '남산타워', emoji: '🗼' },
    { distance: 6000, name: '경복궁', emoji: '🏰' },
    { distance: 7000, name: '서울역', emoji: '🚄' },
    { distance: 8000, name: '여의도 공원', emoji: '🌸' },
    { distance: 9000, name: '롯데월드', emoji: '🎢' },
    { distance: 10000, name: '한강', emoji: '🌊' },

    // 서울 전역 (10km ~ 30km)
    { distance: 12000, name: '올림픽공원', emoji: '🏟️' },
    { distance: 15000, name: '강남역', emoji: '🛍️' },
    { distance: 18000, name: '코엑스', emoji: '🏬' },
    { distance: 20000, name: '잠실 롯데타워', emoji: '🌆' },
    { distance: 25000, name: '북한산', emoji: '⛰️' },
    { distance: 30000, name: '63빌딩', emoji: '🏢' },

    // 수도권 (30km ~ 100km)
    { distance: 35000, name: '수원 화성', emoji: '🏯' },
    { distance: 40000, name: '인천국제공항', emoji: '✈️' },
    { distance: 45000, name: '인천항', emoji: '⚓' },
    { distance: 50000, name: '인천 앞바다', emoji: '⛵' },
    { distance: 60000, name: '용인 에버랜드', emoji: '🎡' },
    { distance: 70000, name: '강화도', emoji: '🏝️' },
    { distance: 80000, name: '평택', emoji: '🏘️' },
    { distance: 90000, name: '천안', emoji: '🌾' },
    { distance: 100000, name: '대전', emoji: '🏙️' },

    // 한국 중부 (100km ~ 300km)
    { distance: 120000, name: '세종시', emoji: '🏛️' },
    { distance: 140000, name: '충주호', emoji: '🛶' },
    { distance: 160000, name: '청주', emoji: '🌆' },
    { distance: 180000, name: '전주', emoji: '🍜' },
    { distance: 200000, name: '대구', emoji: '🌇' },
    { distance: 220000, name: '포항', emoji: '🌅' },
    { distance: 240000, name: '경주', emoji: '🕌' },
    { distance: 260000, name: '울산', emoji: '🏭' },
    { distance: 280000, name: '광주', emoji: '🎨' },
    { distance: 300000, name: '부산', emoji: '🏖️' },

    // 한국 전역 (300km ~ 600km)
    { distance: 350000, name: '해운대 해수욕장', emoji: '🏄' },
    { distance: 400000, name: '제주도', emoji: '🌴' },
    { distance: 450000, name: '한라산', emoji: '🗻' },
    { distance: 500000, name: '독도', emoji: '🏝️' },
    { distance: 550000, name: '백두산', emoji: '⛰️' },
    { distance: 600000, name: '평양', emoji: '🏛️' },

    // 동아시아 (600km ~ 3000km)
    { distance: 700000, name: '중국 베이징', emoji: '🏯' },
    { distance: 800000, name: '중국 상하이', emoji: '🌃' },
    { distance: 900000, name: '대만 타이베이', emoji: '🏙️' },
    { distance: 1000000, name: '일본 도쿄', emoji: '🗾' },
    { distance: 1200000, name: '일본 오사카', emoji: '🏯' },
    { distance: 1500000, name: '홍콩', emoji: '🌆' },
    { distance: 1800000, name: '필리핀 마닐라', emoji: '🏝️' },
    { distance: 2000000, name: '베트남 하노이', emoji: '🛵' },
    { distance: 2500000, name: '태국 방콕', emoji: '🛕' },
    { distance: 3000000, name: '싱가포르', emoji: '🦁' },

    // 아시아 전역 (3000km ~ 8000km)
    { distance: 3500000, name: '말레이시아', emoji: '🕌' },
    { distance: 4000000, name: '인도네시아 발리', emoji: '🏖️' },
    { distance: 4500000, name: '인도 뉴델리', emoji: '🕉️' },
    { distance: 5000000, name: '몰디브', emoji: '🏝️' },
    { distance: 5500000, name: '두바이', emoji: '🏙️' },
    { distance: 6000000, name: '터키 이스탄불', emoji: '🕌' },
    { distance: 6500000, name: '이집트 카이로', emoji: '🐫' },
    { distance: 7000000, name: '사우디 메카', emoji: '🕋' },
    { distance: 8000000, name: '케냐 나이로비', emoji: '🦁' },

    // 유럽 (8000km ~ 12000km)
    { distance: 9000000, name: '프랑스 파리', emoji: '🗼' },
    { distance: 9500000, name: '영국 런던', emoji: '🏰' },
    { distance: 10000000, name: '독일 베를린', emoji: '🍺' },
    { distance: 10500000, name: '이탈리아 로마', emoji: '🏛️' },
    { distance: 11000000, name: '스페인 바르셀로나', emoji: '⚽' },
    { distance: 11500000, name: '네덜란드 암스테르담', emoji: '🌷' },
    { distance: 12000000, name: '러시아 모스크바', emoji: '☃️' },

    // 아메리카 (12000km ~ 18000km)
    { distance: 13000000, name: '캐나다 밴쿠버', emoji: '🍁' },
    { distance: 14000000, name: '미국 LA', emoji: '🎬' },
    { distance: 15000000, name: '미국 하와이', emoji: '🌺' },
    { distance: 16000000, name: '미국 뉴욕', emoji: '🗽' },
    { distance: 17000000, name: '멕시코 칸쿤', emoji: '🌮' },
    { distance: 18000000, name: '브라질 리우', emoji: '⚽' },

    // 오세아니아 & 극지 (18000km ~ 40000km)
    { distance: 19000000, name: '호주 시드니', emoji: '🦘' },
    { distance: 20000000, name: '뉴질랜드', emoji: '🥝' },
    { distance: 25000000, name: '남극', emoji: '🐧' },
    { distance: 30000000, name: '북극', emoji: '🧊' },
    { distance: 40000000, name: '지구 한 바퀴', emoji: '🌍' },

    // 우주 (40000km 이상)
    { distance: 50000000, name: '우주 정거장', emoji: '🛸' },
    { distance: 100000000, name: '달', emoji: '🌕' },
    { distance: 500000000, name: '화성', emoji: '🔴' },
    { distance: 1000000000, name: '목성', emoji: '🪐' },
    { distance: 10000000000, name: '태양계 끝', emoji: '⭐' }
];
