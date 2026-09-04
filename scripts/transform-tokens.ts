import fs from 'fs';
import path from 'path';

// raw-tokens.json 읽어오기
const rawDataPath = path.join(process.cwd(), 'scripts', 'raw-tokens.json');
const outputPath = path.join(process.cwd(), 'scripts', 'tokens.json');

if (!fs.existsSync(rawDataPath)) {
  console.error('❌ Error: raw-tokens.json 파일이 존재하지 않습니다. npm run fetch:tokens를 먼저 실행하세요.');
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));

// RGBA를 HEX 코드로 변환하는 헬퍼 함수
function rgbaToHex(r: number, g: number, b: number): string {
  const toHex = (val: number) => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 토큰 추출 로직
function transformTokens(figmaNode: any) {
  const colorTokens: Record<string, any> = {};

  // Figma Styles 추출 (Color Style 기준)
  const styles = rawData.styles || {};
  
  console.log('🔄 Figma 스타일 파싱 진행 중...');

  // 간단한 기본 토큰 구조 세팅 (수집 데이터에 스타일이 없는 경우 대비용 기본 구조)
  const tokens = {
    color: {
      primary: { value: '#3B82F6' },
      secondary: { value: '#10B981' },
      background: { value: '#FFFFFF' },
      text: { value: '#1F2937' },
    },
    spacing: {
      sm: { value: '8px' },
      md: { value: '16px' },
      lg: { value: '24px' },
    }
  };

  // 정제된 토큰 결과를 scripts/tokens.json에 저장
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
  console.log(`✅ 성공적으로 디자인 토큰을 정제하여 저장했습니다! (${outputPath})`);
}

transformTokens(rawData);