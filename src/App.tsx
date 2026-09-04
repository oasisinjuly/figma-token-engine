import React, { useState, useEffect, useMemo, useRef } from 'react';
import tokensCssRaw from './styles/tokens.css?raw';

interface TokenItem {
  name: string;
  lightVal: string;
  darkVal: string;
  description: string;
  category: string;
  type: 'Color' | 'Typography' | 'Spacing' | 'Radius' | 'Shadow' | 'Other';
}

export default function App() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Interaction States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [toggleState, setToggleState] = useState(true);
  const [sliderVal, setSliderVal] = useState(63);

  // Controls & Inputs States
  const [selectedSegment, setSelectedSegment] = useState<'day' | 'week' | 'month'>('day');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('선택 옵션');
  const [chips, setChips] = useState(['React', 'TypeScript', 'Tailwind CSS', 'Figma']);
  const [textareaVal, setTextareaVal] = useState('여러 줄의 상세 설명 입력...');

  // Dynamic Theme Colors based on Mode
  const dynamicBg = isDarkMode ? '#111827' : 'var(--color-background, #f9fafb)';
  const dynamicSurface = isDarkMode ? '#1f2937' : 'var(--color-surface, #ffffff)';
  const dynamicText = isDarkMode ? '#f9fafb' : 'var(--color-text-primary, #111827)';
  const dynamicBorder = isDarkMode ? '#374151' : 'var(--color-border, #e5e7eb)';
  const dynamicMutedText = isDarkMode ? '#9ca3af' : 'var(--color-text-muted, #6b7280)';

  // Textarea 높이 자동 조절용 Ref 및 핸들러
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    handleTextareaInput();
  }, [textareaVal]);

  // 1. tokens.css 파일 내용을 브라우저 <head>의 <style>에 동적 주입
  useEffect(() => {
    let styleTag = document.getElementById('dynamic-tokens-style') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-tokens-style';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = tokensCssRaw;
  }, [tokensCssRaw]);

  // 2. Description 및 Dark Mode 값 추출 파서 (Map을 사용하여 Token Name 중복 제거)
  const parsedTokens = useMemo<TokenItem[]>(() => {
    const darkValuesMap: Record<string, string> = {};
    const darkBlockMatch = tokensCssRaw.match(/\.dark\s*\{([^}]+)\}/);
    if (darkBlockMatch && darkBlockMatch[1]) {
      const darkLines = darkBlockMatch[1].split('\n');
      darkLines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('--')) {
          const parts = trimmed.split(':');
          if (parts.length >= 2) {
            const varName = parts[0].trim();
            const val = parts.slice(1).join(':').split(';')[0].trim();
            darkValuesMap[varName] = val;
          }
        }
      });
    }

    const lines = tokensCssRaw.split('\n');
    const tokenMap = new Map<string, TokenItem>();
    let currentCategory = 'General';

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('/* =')) {
        const catMatch = trimmed.match(/([0-9]+\.\s*[^=*]+)/);
        if (catMatch) {
          currentCategory = catMatch[1].trim();
        }
      }

      if (trimmed.startsWith('--')) {
        const parts = trimmed.split(':');
        if (parts.length >= 2) {
          const varName = parts[0].trim();
          
          if (tokenMap.has(varName)) return;

          const valAndComment = parts.slice(1).join(':').split(';');
          const rawValue = valAndComment[0].trim();
          const commentMatch = valAndComment[1]?.match(/\/\*\s*(.*?)\s*\*\//);
          
          let description = commentMatch ? commentMatch[1] : '';

          if (!description || description === '-') {
            if (varName.includes('text-primary')) description = '기본 본문 및 헤딩 텍스트의 주 타이포그래피 색상';
            else if (varName.includes('text-secondary')) description = '보조 본문 및 라벨 텍스트 색상';
            else if (varName.includes('text-muted')) description = '부문자, 캡션, 힌트용 보조 텍스트 색상';
            else if (varName.includes('primary')) description = '주요 브랜드 컬러 및 핵심 액션 버튼 강조용';
            else if (varName.includes('secondary')) description = '보조 포인트 컬러 및 성공/완료 상태 표시용';
            else if (varName.includes('background')) description = '전체 애플리케이션의 최하단 배경색';
            else if (varName.includes('surface')) description = '카드, 모달, 패널 등 컨테이너 표면 배경색';
            else if (varName.includes('border')) description = '구분선, 입력창, 카드 테두리에 적용되는 경계선 색상';
            else if (varName.includes('font-family')) description = '글꼴 패밀리 상속 및 기본 타이포그래피 서체';
            else if (varName.includes('font-size')) description = '계층 구조별 표준 텍스트 크기 단위';
            else if (varName.includes('font-weight')) description = '텍스트 굵기 강조 레벨';
            else if (varName.includes('spacing')) description = '컴포넌트 내외부 간격 및 마진/패딩 일관성 표준';
            else if (varName.includes('radius')) description = '버튼, 카드, 모달 모서리의 둥글기 곡률';
            else if (varName.includes('shadow')) description = '위계 감도를 높이는 입체감 있는 쉐도우 그림자';
            else description = '디자인 시스템 기본 구성 스펙 토큰';
          }

          let type: TokenItem['type'] = 'Other';
          if (varName.includes('color')) type = 'Color';
          else if (varName.includes('font') || varName.includes('line-height')) type = 'Typography';
          else if (varName.includes('spacing')) type = 'Spacing';
          else if (varName.includes('border-radius') || varName.includes('radius')) type = 'Radius';
          else if (varName.includes('shadow')) type = 'Shadow';

          const darkVal = darkValuesMap[varName] || '-';

          tokenMap.set(varName, {
            name: varName,
            lightVal: rawValue,
            darkVal,
            description,
            category: currentCategory,
            type,
          });
        }
      }
    });

    return Array.from(tokenMap.values());
  }, [tokensCssRaw]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const showToast = () => {
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const removeChip = (chipToRemove: string) => {
    setChips(chips.filter((chip) => chip !== chipToRemove));
  };

  const sections = [
    { id: 'tokens', name: '0. Design Tokens (tokens.css)' },
    { id: 'navigations', name: '1. Navigations & Controls' },
    { id: 'inputs', name: '2. Inputs & Forms' },
    { id: 'display', name: '3. Information Display' },
    { id: 'feedback', name: '4. Feedback & Status' },
    { id: 'layout', name: '5. Layout & Containers' },
  ];

  return (
    <div 
      className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
      style={{ 
        fontFamily: 'var(--font-family-base, sans-serif)',
        backgroundColor: dynamicBg, 
        color: dynamicText 
      }}
    >
      {/* Toast Notification */}
      {copiedText && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-mono z-50 flex items-center gap-2 border border-gray-700">
          <span>📋</span> 복사완료: <span className="text-blue-300">{copiedText}</span>
        </div>
      )}

      {isToastVisible && (
        <div 
          className="fixed top-5 right-5 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium z-50 flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-md)' }}
        >
          <span>🔔</span> Toast 피드백 테스트 메시지입니다!
        </div>
      )}

      {/* Top Header */}
      <header 
        className="sticky top-0 z-40 border-b transition-colors duration-200"
        style={{ 
          backgroundColor: dynamicSurface, 
          borderColor: dynamicBorder,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h1 className="font-bold leading-tight" style={{ fontSize: 'var(--font-size-2xl)' }}>Figma Token Design System Guidebook</h1>
              <p style={{ color: dynamicMutedText, fontSize: 'var(--font-size-xs)' }}>
                웹 애플리케이션 디자인 시스템 컴포넌트 라이브러리
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-2 px-3 py-1.5 border cursor-pointer transition-all hover:opacity-80"
              style={{ 
                backgroundColor: dynamicBg, 
                borderColor: dynamicBorder,
                color: dynamicText,
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)'
              }}
            >
              <span>{isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
            </button>

            <span 
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-semibold"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-secondary, #10b981) 15%, transparent)',
                borderColor: 'var(--color-secondary, #10b981)',
                color: 'var(--color-secondary, #10b981)'
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-secondary, #10b981)' }}></span>
              Live Synced
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Left Sidebar Nav */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div 
            className="sticky top-24 p-4 border space-y-2 transition-colors duration-200"
            style={{ 
              backgroundColor: dynamicSurface, 
              borderColor: dynamicBorder,
              boxShadow: 'var(--shadow-sm)',
              borderRadius: 'var(--border-radius-lg)'
            }}
          >
            <p className="font-bold uppercase tracking-wider mb-3 px-2" style={{ color: dynamicMutedText, fontSize: 'var(--font-size-xs)' }}>
              Navigation Index
            </p>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="block px-3 py-2 transition-all cursor-pointer font-semibold rounded-md hover:opacity-80"
                style={{ 
                  color: dynamicText, 
                  fontSize: 'var(--font-size-sm)',
                  borderRadius: 'var(--border-radius-md)'
                }}
              >
                {sec.name}
              </a>
            ))}
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 space-y-12 min-w-0">

          {/* SECTION 0. DESIGN TOKENS OVERVIEW */}
          <section id="tokens" className="scroll-mt-24 space-y-4">
            <div 
              className="p-6 border space-y-4 transition-colors duration-200"
              style={{ 
                backgroundColor: dynamicSurface, 
                borderColor: dynamicBorder,
                boxShadow: 'var(--shadow-sm)',
                borderRadius: 'var(--border-radius-lg)'
              }}
            >
              <div>
                <h2 className="font-bold mb-1" style={{ fontSize: 'var(--font-size-xl)' }}>0. 추출된 피그마 디자인 토큰 (tokens.css)</h2>
                <p style={{ color: dynamicMutedText, fontSize: 'var(--font-size-xs)' }}>
                  `tokens.css` 파일에서 실시간 파싱하여 구성한 샘플 데이터 토큰 목록입니다. (클릭 시 CSS 변수 복사)
                </p>
              </div>

              <div className="border overflow-x-auto" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                <table className="w-full text-left border-collapse table-fixed" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, color: dynamicMutedText }}>
                      <th className="p-3 w-1/5">Token Name</th>
                      <th className="p-3 w-1/5">Light Value</th>
                      <th className="p-3 w-1/5">Dark Value</th>
                      <th className="p-3 w-1/5">Description</th>
                      <th className="p-3 w-1/5">Preview (L / D)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono" style={{ borderColor: dynamicBorder }}>
                    {parsedTokens.map((token) => (
                      <tr 
                        key={token.name} 
                        onClick={() => handleCopy(`var(${token.name})`)}
                        className="cursor-pointer transition-all hover:opacity-80"
                      >
                        <td className="p-3 font-bold whitespace-normal break-words" style={{ color: 'var(--color-primary, #3b82f6)' }}>
                          {token.name}
                        </td>
                        <td className="p-3 whitespace-normal break-words text-[11px]">
                          {token.lightVal}
                        </td>
                        <td className="p-3 whitespace-normal break-words text-[11px]">
                          {token.darkVal}
                        </td>
                        <td className="p-3 font-sans text-[11px] leading-relaxed whitespace-normal break-words" style={{ color: dynamicText }}>
                          {token.description}
                        </td>
                        <td className="p-3 font-sans whitespace-normal break-words">
                          {token.type === 'Color' && (
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Light Mode Color Preview */}
                              <div className="flex items-center gap-1" title={`Light: ${token.lightVal}`}>
                                <span 
                                  className="w-4 h-4 rounded border border-gray-300 inline-block shrink-0 shadow-xs" 
                                  style={{ backgroundColor: token.lightVal }} 
                                />
                                <span className="text-[10px] font-mono text-gray-400">L</span>
                              </div>

                              {/* Dark Mode Color Preview */}
                              {token.darkVal !== '-' && (
                                <div className="flex items-center gap-1" title={`Dark: ${token.darkVal}`}>
                                  <span 
                                    className="w-4 h-4 rounded border border-gray-600 inline-block shrink-0 shadow-xs" 
                                    style={{ backgroundColor: token.darkVal }} 
                                  />
                                  <span className="text-[10px] font-mono text-gray-400">D</span>
                                </div>
                              )}
                            </div>
                          )}

                          {token.type === 'Typography' && (
                            <span 
                              className="whitespace-normal break-words inline-block w-full" 
                              style={{ 
                                fontSize: token.name.includes('size') ? `var(${token.name})` : 'inherit',
                                fontWeight: token.name.includes('weight') ? `var(${token.name})` : 'normal',
                                lineHeight: token.name.includes('line-height') ? `var(${token.name})` : 'normal',
                                fontFamily: token.name.includes('family') ? `var(${token.name})` : 'inherit'
                              }}
                            >
                              Aa 샘플
                            </span>
                          )}

                          {token.type === 'Spacing' && (
                            <div className="h-3 bg-blue-500 rounded-xs max-w-full" style={{ width: `var(${token.name})` }} />
                          )}

                          {token.type === 'Radius' && (
                            <div className="w-6 h-6 border-2 border-blue-500 bg-blue-50 shrink-0" style={{ borderRadius: `var(${token.name})` }} />
                          )}

                          {token.type === 'Shadow' && (
                            <div className="w-6 h-6 bg-white border border-gray-100 shrink-0" style={{ boxShadow: `var(${token.name})`, borderRadius: 'var(--border-radius-sm)' }} />
                          )}

                          {token.type === 'Other' && <span className="text-gray-400">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 1. NAVIGATIONS & CONTROLS */}
          <section id="navigations" className="scroll-mt-24 space-y-6">
            <h2 className="font-bold border-b pb-2 flex items-center gap-2" style={{ borderColor: dynamicBorder, fontSize: 'var(--font-size-2xl)' }}>
              <span className="px-2.5 py-0.5 text-xs text-white" style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-sm)' }}>01</span> Navigations & Controls
            </h2>

            <div className="p-6 border space-y-8 transition-colors duration-200" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--border-radius-lg)' }}>
              <div>
                <span className="inline-block px-2 py-0.5 mb-3 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Navigation Bar & Footer</span>
                <div className="border overflow-hidden" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                  <div className="p-3 border-b flex justify-between items-center text-xs" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder }}>
                    <span className="font-bold">Service Title</span>
                    <div className="flex gap-4" style={{ color: dynamicMutedText }}>
                      <span className="cursor-pointer hover:underline">Home</span>
                      <span className="cursor-pointer hover:underline">Features</span>
                      <span className="cursor-pointer hover:underline">Pricing</span>
                    </div>
                  </div>
                  <div className="p-8 text-center text-xs font-semibold" style={{ backgroundColor: dynamicBg, color: dynamicMutedText }}>Main Content Area</div>
                  <div className="p-3 text-[11px] flex justify-between border-t" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder }}>
                    <span>© 2026 Figma Engine.</span>
                    <span className="cursor-pointer hover:underline">Privacy Policy</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6" style={{ borderColor: dynamicBorder }}>
                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Segmented Control</span>
                  <div className="p-1 border inline-flex gap-1 text-xs w-full" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                    {(['day', 'week', 'month'] as const).map((seg) => (
                      <button
                        key={seg}
                        onClick={() => setSelectedSegment(seg)}
                        className="flex-1 py-1.5 text-xs font-medium transition-all cursor-pointer capitalize"
                        style={{
                          backgroundColor: selectedSegment === seg ? dynamicSurface : 'transparent',
                          color: selectedSegment === seg ? 'var(--color-primary, #3b82f6)' : dynamicMutedText,
                          boxShadow: selectedSegment === seg ? 'var(--shadow-sm)' : 'none',
                          borderRadius: 'var(--border-radius-sm)'
                        }}
                      >
                        {seg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Dropdown Menu / Popover</span>
                  <div className="relative inline-block w-full">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-3 py-2 border text-xs flex justify-between items-center cursor-pointer transition-all"
                      style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, color: dynamicText, borderRadius: 'var(--border-radius-md)' }}
                    >
                      <span>{selectedOption}</span>
                      <span>▼</span>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 border z-20 py-1 text-xs divide-y" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--border-radius-md)' }}>
                        {['옵션 1', '옵션 2', '옵션 3'].map((opt) => (
                          <div
                            key={opt}
                            onClick={() => { setSelectedOption(opt); setIsDropdownOpen(false); }}
                            className="px-3 py-2 cursor-pointer transition-all hover:opacity-80"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6" style={{ borderColor: dynamicBorder }}>
                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Breadcrumb & Pagination</span>
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: dynamicMutedText }}>
                      <span className="cursor-pointer hover:underline">Home</span> <span>/</span> <span className="cursor-pointer hover:underline">Category</span> <span>/</span> <span style={{ color: dynamicText }}>Product</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <button className="w-7 h-7 border flex items-center justify-center font-bold cursor-pointer hover:opacity-80" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>&lt;</button>
                      <button className="w-7 h-7 text-white font-bold flex items-center justify-center cursor-pointer" style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-sm)' }}>1</button>
                      <button className="w-7 h-7 border flex items-center justify-center font-bold cursor-pointer hover:opacity-80" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>2</button>
                      <button className="w-7 h-7 border flex items-center justify-center font-bold cursor-pointer hover:opacity-80" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>&gt;</button>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Stepper (Progress Wizard)</span>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary, #3b82f6)' }}>1</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--color-primary, #3b82f6)' }}>단계 1</span>
                    </div>
                    <div className="flex-1 h-0.5 mx-3" style={{ backgroundColor: 'var(--color-primary, #3b82f6)' }} />
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center" style={{ borderColor: dynamicBorder, color: dynamicMutedText }}>2</span>
                      <span className="text-xs font-semibold" style={{ color: dynamicMutedText }}>단계 2</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 2. INPUTS & FORMS */}
          <section id="inputs" className="scroll-mt-24 space-y-6">
            <h2 className="font-bold border-b pb-2 flex items-center gap-2" style={{ borderColor: dynamicBorder, fontSize: 'var(--font-size-2xl)' }}>
              <span className="px-2.5 py-0.5 text-xs text-white" style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-sm)' }}>02</span> Inputs & Forms
            </h2>

            <div className="p-6 border space-y-6 transition-colors duration-200" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--border-radius-lg)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="inline-block px-2 py-0.5 mb-1 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Text Field</span>
                  <input 
                    type="text" 
                    placeholder="입력..." 
                    className="w-full px-3 py-2 border text-xs outline-none transition-colors duration-200" 
                    style={{ backgroundColor: dynamicSurface, color: dynamicText, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }} 
                  />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 mb-1 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Search Bar</span>
                  <input 
                    type="text" 
                    placeholder="🔍 검색..." 
                    className="w-full px-3 py-2 border text-xs outline-none transition-colors duration-200" 
                    style={{ backgroundColor: dynamicSurface, color: dynamicText, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }} 
                  />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 mb-1 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Select Box</span>
                  <select 
                    className="w-full px-3 py-2 border text-xs outline-none cursor-pointer transition-colors duration-200" 
                    style={{ backgroundColor: dynamicSurface, color: dynamicText, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}
                  >
                    <option style={{ backgroundColor: dynamicSurface, color: dynamicText }}>옵션 1</option>
                    <option style={{ backgroundColor: dynamicSurface, color: dynamicText }}>옵션 2</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="inline-block px-2 py-0.5 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Textarea (Multiline)</span>
                  <span className="text-[10px]" style={{ color: dynamicMutedText }}>{textareaVal.length} / 200자</span>
                </div>
                <textarea 
                  ref={textareaRef}
                  value={textareaVal}
                  onChange={(e) => setTextareaVal(e.target.value)}
                  onInput={handleTextareaInput}
                  placeholder="내용을 입력하세요..."
                  rows={1}
                  className="w-full p-3 border text-xs outline-none transition-colors duration-200" 
                  style={{ 
                    backgroundColor: dynamicSurface, 
                    color: dynamicText, 
                    borderColor: dynamicBorder, 
                    borderRadius: 'var(--border-radius-md)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    resize: 'none',
                    minHeight: '80px'
                  }}
                />
              </div>

              <div>
                <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Chip / Tag</span>
                <div className="flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary, #3b82f6) 12%, transparent)',
                        borderColor: 'var(--color-primary, #3b82f6)',
                        color: 'var(--color-primary, #3b82f6)'
                      }}
                    >
                      {chip}
                      <button onClick={() => removeChip(chip)} className="hover:opacity-70 cursor-pointer font-bold">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t" style={{ borderColor: dynamicBorder }}>
                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Checkbox & Radio</span>
                  <div className="flex items-center gap-4 text-xs pt-1">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" defaultChecked className="cursor-pointer" /> Checkbox</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="r" defaultChecked className="cursor-pointer" /> Radio A</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="r" className="cursor-pointer" /> Radio B</label>
                  </div>
                </div>

                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Switch (Toggle) & Range Slider</span>
                  <div className="flex items-center gap-6 text-xs pt-1">
                    <button
                      onClick={() => setToggleState(!toggleState)}
                      className="w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all shrink-0"
                      style={{ backgroundColor: toggleState ? 'var(--color-primary, #3b82f6)' : dynamicBorder }}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${toggleState ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>

                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderVal}
                        onChange={(e) => setSliderVal(Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--color-primary, #3b82f6) 0%, var(--color-primary, #3b82f6) ${sliderVal}%, ${dynamicBorder} ${sliderVal}%, ${dynamicBorder} 100%)`
                        }}
                      />
                      <span className="font-mono text-xs w-8 text-right">{sliderVal}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3. INFORMATION DISPLAY */}
          <section id="display" className="scroll-mt-24 space-y-6">
            <h2 className="font-bold border-b pb-2 flex items-center gap-2" style={{ borderColor: dynamicBorder, fontSize: 'var(--font-size-2xl)' }}>
              <span className="px-2.5 py-0.5 text-xs text-white" style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-sm)' }}>03</span> Information Display
            </h2>

            <div className="p-4 border transition-colors duration-200" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--border-radius-lg)' }}>
              <span className="inline-block px-2 py-0.5 mb-3 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Avatar & Badge</span>
              <div className="flex items-center gap-6">
                <div className="relative inline-block cursor-pointer">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">HY</div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="relative inline-block cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">👤</div>
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white">9+</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border space-y-3 p-4 transition-colors duration-200" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--border-radius-lg)' }}>
                <span className="inline-block px-2 py-0.5 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Card</span>
                <div className="border overflow-hidden cursor-pointer transition-all hover:opacity-90" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-lg)' }}>
                  <div className="h-24 flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--color-primary, #3b82f6)', fontSize: 'var(--font-size-md)' }}>
                    Media Card Header
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="font-bold" style={{ color: dynamicText, fontSize: 'var(--font-size-base)' }}>카드 제목</p>
                    <p style={{ color: dynamicMutedText, fontSize: 'var(--font-size-xs)' }}>독립적인 정보 단위를 상자 형태로 표현합니다.</p>
                  </div>
                </div>
              </div>

              <div className="border space-y-3 p-4 transition-colors duration-200" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--border-radius-lg)' }}>
                <span className="inline-block px-2 py-0.5 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Accordion</span>
                <div className="border text-xs" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                  <button onClick={() => setIsAccordionOpen(!isAccordionOpen)} className="w-full p-3 flex justify-between items-center font-bold border-b cursor-pointer transition-all" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, color: dynamicText }}>
                    <span>아코디언 토글 (클릭)</span><span>{isAccordionOpen ? '▲' : '▼'}</span>
                  </button>
                  {isAccordionOpen && <div className="p-3" style={{ color: dynamicText, fontSize: 'var(--font-size-xs)' }}>펼쳐진 상세 정보 컨텐츠입니다.</div>}
                </div>
              </div>
            </div>

            <div className="p-4 border transition-colors duration-200" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--border-radius-lg)' }}>
              <span className="inline-block px-2 py-0.5 mb-3 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Table / Data Grid</span>
              <div className="border overflow-hidden" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, color: dynamicMutedText }}>
                      <th className="p-3 font-bold">ID</th>
                      <th className="p-3 font-bold">Token Name</th>
                      <th className="p-3 font-bold">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono" style={{ borderColor: dynamicBorder }}>
                    <tr className="cursor-pointer hover:opacity-80">
                      <td className="p-3 font-bold">01</td>
                      <td className="p-3 font-bold" style={{ color: 'var(--color-primary, #3b82f6)' }}>--color-primary</td>
                      <td className="p-3 font-bold">#3b82f6</td>
                    </tr>
                    <tr className="cursor-pointer hover:opacity-80">
                      <td className="p-3 font-bold">02</td>
                      <td className="p-3 font-bold" style={{ color: 'var(--color-primary, #3b82f6)' }}>--spacing-md</td>
                      <td className="p-3 font-bold">16px</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 4. FEEDBACK & STATUS */}
          <section id="feedback" className="scroll-mt-24 space-y-6">
            <h2 className="font-bold border-b pb-2 flex items-center gap-2" style={{ borderColor: dynamicBorder, fontSize: 'var(--font-size-2xl)' }}>
              <span className="px-2.5 py-0.5 text-xs text-white" style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-sm)' }}>04</span> Feedback & Status
            </h2>

            <div className="p-6 border space-y-6 transition-colors duration-200" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--border-radius-lg)' }}>
              <div>
                <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Alert Banner</span>
                <div 
                  className="p-3 border text-xs flex justify-between items-center"
                  style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--color-secondary, #10b981) 15%, transparent)',
                    borderColor: 'var(--color-secondary, #10b981)',
                    color: dynamicText,
                    borderRadius: 'var(--border-radius-md)'
                  }}
                >
                  <span>⚠️ <strong>Alert Banner:</strong> `--color-secondary` 토큰이 적용된 시스템 알림입니다.</span>
                  <button className="font-bold cursor-pointer hover:opacity-75">✕</button>
                </div>
              </div>

              <div>
                <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Linear Progress Bar</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>진행 상태</span>
                    <span style={{ color: dynamicMutedText }}>75%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: dynamicBorder }}>
                    <div className="h-full rounded-full" style={{ width: '75%', backgroundColor: 'var(--color-primary, #3b82f6)' }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t" style={{ borderColor: dynamicBorder }}>
                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Tooltip (Hover UI)</span>
                  <div className="relative inline-block group">
                    <span className="inline-block px-3 py-1.5 border text-xs font-semibold cursor-pointer select-none" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                      마우스를 올려보세요 💡
                    </span>
                    <div 
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none"
                    >
                      <div 
                        className="px-2.5 py-1 text-[11px] text-white rounded shadow-lg whitespace-nowrap font-medium"
                        style={{ backgroundColor: '#1f2937' }}
                      >
                        디자인 시스템 툴팁 안내 문구입니다!
                      </div>
                      <div className="w-2 h-2 -mt-1 rotate-45" style={{ backgroundColor: '#1f2937' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Button (Toast & Modal Trigger)</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={showToast} 
                      className="px-4 py-2 text-white font-semibold cursor-pointer transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-md)', fontSize: 'var(--font-size-sm)' }}
                    >
                      Toast 실행
                    </button>
                    <button 
                      onClick={() => setIsModalOpen(true)} 
                      className="px-4 py-2 text-white font-semibold cursor-pointer transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-secondary, #10b981)', borderRadius: 'var(--border-radius-md)', fontSize: 'var(--font-size-sm)' }}
                    >
                      Modal 실행
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t" style={{ borderColor: dynamicBorder }}>
                <span className="inline-block px-2 py-0.5 mb-3 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Spinner & Skeleton Loading</span>
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary, #3b82f6)', borderTopColor: 'transparent' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 rounded animate-pulse" style={{ backgroundColor: dynamicBorder, width: '40%' }} />
                    <div className="h-2 rounded animate-pulse" style={{ backgroundColor: dynamicBorder, width: '80%' }} />
                  </div>
                </div>
              </div>

            </div>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-xs">
                <div className="p-6 max-w-xs w-full space-y-3 border" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--border-radius-lg)' }}>
                  <h4 className="font-bold" style={{ color: dynamicText, fontSize: 'var(--font-size-xl)' }}>Modal Title</h4>
                  <p style={{ color: dynamicMutedText, fontSize: 'var(--font-size-sm)' }}>tokens.css 변수가 적용된 다이얼로그 모달입니다.</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setIsModalOpen(false)} className="px-3 py-1 text-xs cursor-pointer border hover:opacity-80" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>닫기</button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 5. LAYOUT & CONTAINERS */}
          <section id="layout" className="scroll-mt-24 space-y-6">
            <h2 className="font-bold border-b pb-2 flex items-center gap-2" style={{ borderColor: dynamicBorder, fontSize: 'var(--font-size-2xl)' }}>
              <span className="px-2.5 py-0.5 text-xs text-white" style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-sm)' }}>05</span> Layout & Containers
            </h2>

            <div className="p-6 border space-y-8 transition-colors duration-200" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder, boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--border-radius-lg)' }}>
              <div>
                <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>12 Column Grid System</span>
                <div className="grid grid-cols-12 text-center text-[10px] font-mono" style={{ gap: 'var(--spacing-xs)' }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="py-2 border cursor-pointer transition-all font-semibold hover:opacity-80"
                      style={{ 
                        backgroundColor: 'color-mix(in srgb, var(--color-primary, #3b82f6) 10%, transparent)', 
                        borderColor: 'var(--color-primary, #3b82f6)', 
                        color: 'var(--color-primary, #3b82f6)',
                        borderRadius: 'var(--border-radius-sm)'
                      }}
                    >
                      C{i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6" style={{ borderColor: dynamicBorder }}>
                <span className="inline-block px-2 py-0.5 mb-3 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Application Layout Patterns (2-Column & 3-Column)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center text-xs font-bold">
                  <div className="border p-3 space-y-2" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                    <p className="text-left text-[11px] font-bold" style={{ color: dynamicText }}>2-Column Layout (Sidebar + Main)</p>
                    <div className="flex gap-2 h-28">
                      <div className="w-1/3 border flex items-center justify-center" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Sidebar</div>
                      <div className="w-2/3 border flex items-center justify-center" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Main Content</div>
                    </div>
                  </div>

                  <div className="border p-3 space-y-2" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                    <p className="text-left text-[11px] font-bold" style={{ color: dynamicText }}>3-Column Layout (Nav + Content + Panel)</p>
                    <div className="flex gap-2 h-28">
                      <div className="w-1/4 border flex items-center justify-center" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Nav</div>
                      <div className="w-2/4 border flex items-center justify-center" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Feed / Content</div>
                      <div className="w-1/4 border flex items-center justify-center" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Panel</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6" style={{ borderColor: dynamicBorder }}>
                <span className="inline-block px-2 py-0.5 mb-3 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Responsive Auto-Fit Grid (1~4 Columns)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="p-3 border space-y-1 cursor-pointer transition-all hover:opacity-80" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                      <span className="inline-block px-2 py-0.5 text-[9px] text-white font-bold" style={{ backgroundColor: 'var(--color-primary, #3b82f6)', borderRadius: 'var(--border-radius-sm)' }}>Card 0{num}</span>
                      <p className="font-bold text-xs" style={{ color: dynamicText }}>가변형 반응형 상자</p>
                      <p className="text-[10px]" style={{ color: dynamicMutedText }}>화면 폭에 맞게 컬럼 수가 개별 조절됩니다.</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6" style={{ borderColor: dynamicBorder }}>
                <span className="inline-block px-2 py-0.5 mb-3 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Aspect Ratio Containers (16:9, 4:3, 1:1)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="aspect-video border flex flex-col justify-center items-center cursor-pointer hover:opacity-80" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                    <span className="font-bold text-sm">16 : 9</span>
                    <span className="text-[10px]" style={{ color: dynamicMutedText }}>Video / Banner</span>
                  </div>
                  <div className="aspect-4/3 border flex flex-col justify-center items-center cursor-pointer hover:opacity-80" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                    <span className="font-bold text-sm">4 : 3</span>
                    <span className="text-[10px]" style={{ color: dynamicMutedText }}>Standard Media</span>
                  </div>
                  <div className="aspect-square border flex flex-col justify-center items-center cursor-pointer hover:opacity-80" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                    <span className="font-bold text-sm">1 : 1</span>
                    <span className="text-[10px]" style={{ color: dynamicMutedText }}>Thumbnail / Avatar</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6" style={{ borderColor: dynamicBorder }}>
                <div className="space-y-4">
                  <span className="inline-block px-2 py-0.5 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Dividers & Separators</span>
                  <div className="space-y-3 text-xs">
                    <p style={{ color: dynamicMutedText }}>Solid Horizontal Divider</p>
                    <div className="border-b" style={{ borderColor: dynamicBorder }} />
                    <p style={{ color: dynamicMutedText }}>Dashed Divider</p>
                    <div className="border-b border-dashed" style={{ borderColor: dynamicBorder }} />
                    <p style={{ color: dynamicMutedText }}>Inline Vertical Divider</p>
                    <div className="flex items-center gap-3 font-semibold">
                      <span>Option A</span>
                      <span className="h-3 w-[1px] bg-gray-300 inline-block" />
                      <span>Option B</span>
                      <span className="h-3 w-[1px] bg-gray-300 inline-block" />
                      <span>Option C</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="inline-block px-2 py-0.5 mb-2 font-mono text-[10px] border font-bold" style={{ backgroundColor: dynamicBg, borderColor: dynamicBorder, borderRadius: 'var(--border-radius-sm)' }}>Scrollable Container (Sticky Header)</span>
                  <div className="h-32 overflow-y-auto border text-xs" style={{ borderColor: dynamicBorder, borderRadius: 'var(--border-radius-md)' }}>
                    <div className="sticky top-0 p-2 font-bold border-b" style={{ backgroundColor: dynamicSurface, borderColor: dynamicBorder }}>
                      📌 Sticky Section Header
                    </div>
                    <div className="p-3 space-y-2">
                      <p>스크롤 가능한 컨테이너 내부 1번 항목입니다.</p>
                      <p>스크롤 가능한 컨테이너 내부 2번 항목입니다.</p>
                      <p>스크롤 가능한 컨테이너 내부 3번 항목입니다.</p>
                      <p>스크롤 가능한 컨테이너 내부 4번 항목입니다.</p>
                      <p>스크롤 가능한 컨테이너 내부 5번 항목입니다.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}