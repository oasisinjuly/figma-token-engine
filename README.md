# 🎨 figma-token-engine

Figma의 디자인 토큰(`tokens.css`) 데이터를 동적으로 파싱하여 웹 스타일로 변환함. 실시간 테마 전환 및 UI 컴포넌트 패턴을 시각화해 주는 **디자인 시스템 라이브 가이드북**임. Figma API 연동 파이프라인부터 Tailwind CSS v4 기반의 다양한 인터랙티브 UI 컴포넌트까지 통합 제공함.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?style=for-the-badge&logo=github)](https://oasisinjuly.github.io/figma-token-engine)

🔗 **데모 페이지:** [https://oasisinjuly.github.io/figma-token-engine](https://oasisinjuly.github.io/figma-token-engine)

---

## 📌 주요 기능

- **동적 디자인 토큰 파싱 & 클립보드 복사:** `tokens.css` 원시 코드를 동적으로 파싱해 `<head>`에 주입함. 클릭 한 번으로 `var(--token-name)` 형태 복사를 지원함.
- **실시간 다크 모드 (Dark Mode):** CSS 변수 매핑을 활용해 단 한 번의 토글 클릭으로 전체 UI 및 테마 시스템을 동적으로 변경함.
- **6개 카테고리별 UI 컴포넌트 라이브러리:** Navigation, Forms, Info Display, Feedback, Layout 등 실제 웹 서비스에서 쓰이는 모듈형 컴포넌트 패턴을 수록함.
- **인터랙티브 컴포넌트 실습:** Toast, Modal, Auto-resizing Textarea, Segmented Control, Stepper, Slider 등 상태 기반의 동작 테스트를 지원함.
- **Figma API 토큰 추출 & 변환 파이프라인:** Figma API를 통해 토큰 수집 후 CSS/JSON으로 가공하는 자동화 스크립트를 구축함.

---

## 🛠 기술 스택

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS v4, PostCSS, CSS Custom Properties (Design Tokens)
- **Token Management:** Style Dictionary, `tsx`
- **Deployment:** GitHub Pages (`gh-pages`)

---

## 💡 성능 및 구조 최적화 포인트 (Why & How)

1. **`tokens.css?raw` 동적 파싱을 통한 런타임 토큰 분석**
   - CSS 빌드 타임에 고정되는 방식 대신 Raw 문자열로 수록함. 브라우저 `<head>`에 동적 주입(`style` 태그)하고 정규식 파싱을 거쳐 런타임에 토큰 테이블 및 시각화 프리뷰를 실시간 생성함.
2. **`useMemo` 기반의 토큰 분류 및 동적 테마 연산**
   - 수십~수백 개의 CSS 토큰 분석 시 불필요한 반복 파싱을 차단함. `useMemo`로 토큰 카테고리화(Color, Typography, Spacing, Radius 등) 및 모드별 값을 메모이제이션함.
3. **단일 통합 `tsconfig.json` 구조 단순화**
   - Vite 기본 템플릿의 multi-tsconfig 분리로 발생하는 빌드 에러를 방지함. 단일 설정 파일과 `noUnusedLocals` 완화를 통해 빌드 및 배포 안정성을 확보함.
4. **Windows CLI 경로 한계(`ENAMETOOLONG`) 우회 배포 스크립트**
   - `node_modules` 전체 클론 시 발생하는 Windows 경로 길이 에러를 방지함. `dist` 빌드 결과물만 `gh-pages` 브랜치에 직접 푸시하는 배포 파이프라인을 구축함.

---

## 📂 프로젝트 구조 (Project Structure)

```text
figma-token-engine/
├── scripts/              # Figma API 토큰 추출 및 변환 파이프라인
│   ├── fetch-tokens.ts   # Figma API 호출 및 원시 데이터 수집
│   ├── build-tokens.ts   # 수집된 데이터를 Style Dictionary 형식으로 가공
│   └── transform-tokens.ts # 웹 표준 CSS 및 JSON 토큰 생성
├── src/
│   ├── assets/           # 정적 리소스 파일
│   ├── styles/           # 디자인 토큰 CSS 및 JSON
│   │   ├── tokens.css    # 브라우저 주입용 디자인 토큰 스타일
│   │   └── tokens.json   # 시스템 매핑용 JSON 토큰
│   ├── App.tsx           # 토큰 뷰어 & UI 컴포넌트 가이드북 메인
│   └── main.tsx          # 애플리케이션 엔트리 포인트
├── .env                  # Figma API Key 및 Access Token 설정
├── vite.config.ts        # Vite 및 Tailwind v4 설정
├── tsconfig.json         # TypeScript 통합 모듈 및 타겟 설정
└── package.json          # 프로젝트 의존성 및 스크립트 정의
```

---

## 🏃‍♂️ 실행 방법

```bash
# 1. 저장소 클론
git clone [https://github.com/oasisinjuly/figma-token-engine.git](https://github.com/oasisinjuly/figma-token-engine.git)
cd figma-token-engine

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정 (.env 파일 생성)
FIGMA_ACCESS_TOKEN=your_figma_personal_access_token
FIGMA_FILE_KEY=your_figma_file_key

# 4. 피그마 토큰 동기화 실행 (선택 사항)
npm run tokens

# 5. 개발 서버 실행
npm run dev
```
