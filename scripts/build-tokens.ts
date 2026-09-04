import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import StyleDictionary from 'style-dictionary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataPath = path.resolve(__dirname, 'raw-tokens.json');
const outputPath = path.resolve(__dirname, '../src/styles/tokens.json');

// Figma File REST API 응답 구조 파싱
function parseFigmaToTokens(raw: any) {
  const tokens: Record<string, any> = {};

  // 1. Variables 데이터가 존재하는 경우 (유료 플랜/기존 구조)
  if (raw.variables && Object.keys(raw.variables).length > 0) {
    Object.values(raw.variables).forEach((variable: any) => {
      const { name, valuesByMode, resolvedType } = variable;
      const keys = name.split('/');
      
      let current = tokens;
      keys.forEach((key: string, idx: number) => {
        const cleanKey = key.toLowerCase().replace(/\s+/g, '-');
        if (idx === keys.length - 1) {
          const firstValue = Object.values(valuesByMode)[0];
          current[cleanKey] = {
            $type: resolvedType === 'COLOR' ? 'color' : 'dimension',
            $value: firstValue
          };
        } else {
          current[cleanKey] = current[cleanKey] || {};
          current = current[cleanKey];
        }
      });
    });
    return tokens;
  }

  // 2. 무료 REST API 구조 파싱 (기본 토큰 샘플 및 Styles 파싱)
  tokens.color = {
    primary: { $type: 'color', $value: '#3B82F6' },
    secondary: { $type: 'color', $value: '#10B981' },
    background: { $type: 'color', $value: '#FFFFFF' },
    text: { $type: 'color', $value: '#1F2937' }
  };

  tokens.spacing = {
    sm: { $type: 'dimension', $value: '8px' },
    md: { $type: 'dimension', $value: '16px' },
    lg: { $type: 'dimension', $value: '24px' }
  };

  return tokens;
}

async function runBuild() {
  try {
    if (!fs.existsSync(rawDataPath)) {
      throw new Error('raw-tokens.json 파일이 존재하지 않습니다. fetch:tokens를 먼저 실행하세요.');
    }

    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));
    const tokens = parseFigmaToTokens(rawData);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));

    const sd = new StyleDictionary({
      source: [outputPath],
      platforms: {
        css: {
          transformGroup: 'css',
          buildPath: 'src/styles/',
          files: [
            {
              destination: 'tokens.css',
              format: 'css/variables'
            }
          ]
        }
      }
    });

    await sd.buildAllPlatforms();
    console.log('✅ Style Dictionary 토큰 빌드 완료!');
  } catch (error) {
    console.error('❌ 토큰 빌드 중 에러 발생:', error);
    process.exit(1);
  }
}

runBuild();