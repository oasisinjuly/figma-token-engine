import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Error: FIGMA_ACCESS_TOKEN 또는 FIGMA_FILE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

// 무료 계정 지원: Figma File REST API 호출
async function fetchFigmaData() {
  console.log('🚀 Figma API 요청 시작 (File REST API)...');
  
  try {
    const response = await fetch(
      `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN as string,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API 요청 실패 (Status: ${response.status})`);
    }

    const data = await response.json();
    
    const outputPath = path.join(process.cwd(), 'scripts', 'raw-tokens.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`✅ 성공적으로 Figma 파일 데이터를 수집했습니다! (${outputPath})`);
  } catch (error) {
    console.error('❌ 데이터 추출 중 오류 발생:', error);
  }
}

fetchFigmaData();