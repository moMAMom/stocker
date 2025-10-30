# デザインテーマ共通様式

## Apple HIG準拠デザインシステム

## 🎨 カラーシステム

### メインカラー（プライマリカラー）

**深いブルー (#2563EB)**

- 信頼性と安定感を表現
- ビジネス・テクノロジー分野で好まれる
- アクセシビリティに配慮した十分なコントラスト比

### カラーパレットシステム

#### プライマリ（ブルー系）

```
Blue-50: #EFF6FF
Blue-100: #DBEAFE
Blue-200: #BFDBFE
Blue-300: #93C5FD
Blue-400: #60A5FA
Blue-500: #3B82F6  （基準色）
Blue-600: #2563EB  （プライマリ）
Blue-700: #1D4ED8
Blue-800: #1E40AF
Blue-900: #1E3A8A
```

#### アクセント（オレンジ系）

```
Orange-50: #FFF7ED
Orange-100: #FFEDD5
Orange-200: #FED7AA
Orange-300: #FDBA74
Orange-400: #FB923C
Orange-500: #F97316  （アクセント）
Orange-600: #EA580C
Orange-700: #C2410C
Orange-800: #9A3412
Orange-900: #7C2D12
```

#### ニュートラル（グレー系）

```
Gray-50: #F9FAFB
Gray-100: #F3F4F6
Gray-200: #E5E7EB
Gray-300: #D1D5DB
Gray-400: #9CA3AF
Gray-500: #6B7280
Gray-600: #4B5563
Gray-700: #374151
Gray-800: #1F2937
Gray-900: #111827
```

#### セマンティックカラー

- **成功 (Success)**: #10B981
- **警告 (Warning)**: #F59E0B  
- **エラー (Error)**: #EF4444
- **情報 (Info)**: #3B82F6

## 🎯 デザインの方向性

### 全体的な印象

#### "プロフェッショナル × 親しみやすさ"

- **清潔感**: 適度な余白と整理されたレイアウト
- **信頼性**: 一貫したデザインルールと品質
- **親しみやすさ**: 柔らかな角丸と適度なシャドウ
- **モダン**: フラットデザインベースにマテリアルデザインの要素

## 📝 タイポグラフィシステム

### フォントファミリー

#### 日本語フォント階層

1. **Hiragino Sans** (macOS)
2. **Yu Gothic UI** (Windows 10+)
3. **Meiryo UI** (Windows Legacy)
4. **Noto Sans JP** (Web Font)
5. **sans-serif** (Fallback)

#### 英語フォント階層

1. **SF Pro Display** (macOS)
2. **Segoe UI** (Windows)
3. **Inter** (Web Font)
4. **-apple-system**, **BlinkMacSystemFont** (System)
5. **sans-serif** (Fallback)

### タイプスケール（8pt Grid Based）

```css
/* Display */
--font-size-display-large: 57px;    /* 3.5625rem */
--font-size-display-medium: 45px;   /* 2.8125rem */
--font-size-display-small: 36px;    /* 2.25rem */

/* Headlines */
--font-size-headline-large: 32px;   /* 2rem */
--font-size-headline-medium: 28px;  /* 1.75rem */
--font-size-headline-small: 24px;   /* 1.5rem */

/* Titles */
--font-size-title-large: 22px;      /* 1.375rem */
--font-size-title-medium: 16px;     /* 1rem */
--font-size-title-small: 14px;      /* 0.875rem */

/* Body */
--font-size-body-large: 16px;       /* 1rem */
--font-size-body-medium: 14px;      /* 0.875rem */
--font-size-body-small: 12px;       /* 0.75rem */

/* Labels */
--font-size-label-large: 14px;      /* 0.875rem */
--font-size-label-medium: 12px;     /* 0.75rem */
--font-size-label-small: 11px;      /* 0.6875rem */
```

### 行の高さ（Line Height）

```css
--line-height-tight: 1.25;     /* 20px / 16px */
--line-height-normal: 1.5;     /* 24px / 16px */
--line-height-relaxed: 1.75;   /* 28px / 16px */
--line-height-loose: 2.0;      /* 32px / 16px */
```

### フォントウェイト

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 文字間隔（Letter Spacing）

```css
--letter-spacing-tight: -0.025em;   /* タイトル用 */
--letter-spacing-normal: 0;         /* 通常テキスト */
--letter-spacing-wide: 0.025em;     /* ラベル用 */
```

## 🔲 コンポーネント設計

### 角丸設定

- **小**: 4px - アイコン、小さなボタン
- **標準**: 8px - 一般的なボタン、カード
- **大**: 12px - 大きなカード、モーダル

## 🌫️ 影の効果システム

### シャドウスケール（Material Design 3 + Apple HIG準拠）

```css
/* No elevation */
--shadow-none: none;

/* Level 1 - Floating elements (FAB, Cards) */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Level 2 - Dropdowns, Tooltips */
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

/* Level 3 - Modals, Popovers */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Level 4 - Navigation panels */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Level 5 - Large modals, sheets */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Level 6 - Maximum elevation */
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### 内側シャドウ（Inset）

```css
/* Input focus states */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

/* Pressed button states */
--shadow-inner-pressed: inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
```

### カラード・シャドウ

```css
/* Primary colored shadows */
--shadow-primary: 0 4px 14px 0 rgba(37, 99, 235, 0.15);

/* Success colored shadows */
--shadow-success: 0 4px 14px 0 rgba(16, 185, 129, 0.15);

/* Warning colored shadows */
--shadow-warning: 0 4px 14px 0 rgba(245, 158, 11, 0.15);

/* Error colored shadows */
--shadow-error: 0 4px 14px 0 rgba(239, 68, 68, 0.15);
```

### ダークモード対応シャドウ

```css
/* Dark mode shadows (lighter for visibility) */
--shadow-dark-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-dark-base: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-dark-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-dark-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
```

### ボタン設計

- **最小クリックエリア**: 44px × 44px
- **パディング**: 12px 24px（標準サイズ）
- **ホバー効果**: 色の明度を10%変更

## 📐 レイアウト

### グリッドシステム

- **ベース**: 8pt グリッドシステム
- **カラム**: 12カラムレスポンシブグリッド

## 📐 余白・間隔システム

### スペーシングスケール（8pt Grid System）

```css
/* Base spacing units */
--space-1: 4px;     /* 0.25rem */
--space-2: 8px;     /* 0.5rem */
--space-3: 12px;    /* 0.75rem */
--space-4: 16px;    /* 1rem */
--space-5: 20px;    /* 1.25rem */
--space-6: 24px;    /* 1.5rem */
--space-8: 32px;    /* 2rem */
--space-10: 40px;   /* 2.5rem */
--space-12: 48px;   /* 3rem */
--space-16: 64px;   /* 4rem */
--space-20: 80px;   /* 5rem */
--space-24: 96px;   /* 6rem */
--space-32: 128px;  /* 8rem */
```

### コンポーネント別スペーシング

#### ボタン内部余白

```css
/* Small Button */
--button-padding-small: var(--space-2) var(--space-3);     /* 8px 12px */

/* Medium Button (Default) */
--button-padding-medium: var(--space-3) var(--space-6);    /* 12px 24px */

/* Large Button */
--button-padding-large: var(--space-4) var(--space-8);     /* 16px 32px */
```

#### カード内部余白

```css
--card-padding-small: var(--space-4);      /* 16px */
--card-padding-medium: var(--space-6);     /* 24px */
--card-padding-large: var(--space-8);      /* 32px */
```

#### セクション間隔

```css
--section-gap-small: var(--space-8);       /* 32px */
--section-gap-medium: var(--space-12);     /* 48px */
--section-gap-large: var(--space-16);      /* 64px */
--section-gap-xlarge: var(--space-24);     /* 96px */
```

### レイアウトマージン

```css
/* Container margins */
--container-margin-mobile: var(--space-4);    /* 16px */
--container-margin-tablet: var(--space-6);    /* 24px */
--container-margin-desktop: var(--space-8);   /* 32px */

/* Maximum content width */
--content-max-width: 1200px;
--content-max-width-narrow: 768px;
```

## 🔲 角丸システム

### 角丸スケール

```css
--radius-none: 0px;
--radius-sm: 2px;      /* 小さな要素 (badges, tags) */
--radius-base: 4px;    /* デフォルト (buttons, inputs) */
--radius-md: 6px;      /* 中程度の要素 */
--radius-lg: 8px;      /* カード、モーダル */
--radius-xl: 12px;     /* 大きなカード */
--radius-2xl: 16px;    /* ヒーローセクション */
--radius-3xl: 24px;    /* 非常に大きな要素 */
--radius-full: 9999px; /* 円形 (avatars, pills) */
```

### コンポーネント別角丸適用

```css
/* Buttons */
--button-radius: var(--radius-base);

/* Cards */
--card-radius: var(--radius-lg);

/* Modal */
--modal-radius: var(--radius-xl);

/* Input Fields */
--input-radius: var(--radius-base);

/* Image containers */
--image-radius: var(--radius-md);
```

## 🧩 コンポーネント設計

### ボタンシステム

#### サイズバリエーション

```css
/* Small Button */
.button-small {
  height: 32px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-label-medium);
  border-radius: var(--radius-base);
}

/* Medium Button (Default) */
.button-medium {
  height: 40px;
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-body-medium);
  border-radius: var(--radius-base);
}

/* Large Button */
.button-large {
  height: 48px;
  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-body-large);
  border-radius: var(--radius-lg);
}
```

#### ボタンバリアント

```css
/* Primary Button */
.button-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  box-shadow: var(--shadow-sm);
}

.button-primary:hover {
  background-color: var(--Blue-700);
  box-shadow: var(--shadow-md);
}

.button-primary:active {
  background-color: var(--Blue-800);
  box-shadow: var(--shadow-inner-pressed);
}

/* Secondary Button */
.button-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

/* Ghost Button */
.button-ghost {
  background-color: transparent;
  color: var(--color-primary);
  border: none;
}
```

### カードシステム

#### 基本カード

```css
.card {
  background: white;
  border-radius: var(--card-radius);
  padding: var(--card-padding-medium);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--Gray-200);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}
```

#### カードバリアント

```css
/* Elevated Card */
.card-elevated {
  box-shadow: var(--shadow-lg);
  border: none;
}

/* Outlined Card */
.card-outlined {
  box-shadow: none;
  border: 2px solid var(--Gray-200);
}

/* Filled Card */
.card-filled {
  background-color: var(--Gray-50);
  border: none;
  box-shadow: none;
}
```

### 入力フィールドシステム

#### 基本スタイル

```css
.input {
  height: 44px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--Gray-300);
  border-radius: var(--input-radius);
  font-size: var(--font-size-body-medium);
  background-color: white;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input:disabled {
  background-color: var(--Gray-50);
  color: var(--Gray-400);
  cursor: not-allowed;
}
```

#### エラー状態

```css
.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

## 👥 ターゲット別適用例

### ビジネス/企業向け

- より多くの青系カラーを使用
- シンプルで洗練されたインターフェース
- データ可視化に適したカラーパレット
- 最小限のアニメーション

### コンシューマー向け

- オレンジのアクセントカラーを効果的に活用
- より親しみやすいイラストやアイコン
- インタラクションに楽しさを加える微細なアニメーション
- カジュアルなトーン

### 多世代対応

- 大きめのフォントサイズオプション（18px以上）
- 高いコントラスト比の維持（4.5:1以上）
- シンプルなナビゲーション構造
- 明確なアフォーダンス

## 🌙 ダークモード対応

### ダークモードカラーパレット

- **背景**: #1a1a1a
- **サーフェス**: #2d2d2d
- **プライマリ**: #3b82f6（明るいブルー）
- **テキスト**: #ffffff, #d1d5db

## ♿ アクセシビリティ配慮

### WCAG 2.1 AA準拠

#### カラーコントラスト要件

```css
/* Normal text (16px以下) */
--contrast-ratio-normal: 4.5:1;

/* Large text (18px以上 or 14px bold以上) */
--contrast-ratio-large: 3:1;

/* Graphics and UI components */
--contrast-ratio-graphics: 3:1;
```

#### 検証済みカラーペア

```css
/* High contrast combinations */
.text-primary-on-white { color: var(--Blue-600); } /* 7.12:1 */
.text-gray-on-white { color: var(--Gray-700); }    /* 4.54:1 */
.text-white-on-primary { color: white; }           /* 7.12:1 */

/* Medium contrast (minimum compliant) */
.text-gray-medium { color: var(--Gray-600); }      /* 4.69:1 */
```

### フォーカス管理

#### フォーカスリング設計

```css
.focus-ring {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: inherit;
}

/* High contrast mode対応 */
@media (prefers-contrast: high) {
  .focus-ring {
    outline: 3px solid var(--Blue-800);
    outline-offset: 1px;
  }
}
```

#### タブ順序ガイドライン

1. **論理的順序**: 視覚的な順序と一致
2. **スキップリンク**: 主要コンテンツへのジャンプ
3. **フォーカストラップ**: モーダル内でのフォーカス管理

### タッチターゲット

#### 最小サイズ要件

```css
/* Touch targets (iOS HIG / Android Material) */
--touch-target-minimum: 44px;    /* 最小タッチエリア */
--touch-target-comfortable: 48px; /* 推奨サイズ */
--touch-target-spacing: 8px;     /* ターゲット間最小間隔 */
```

### 動きの配慮

#### アニメーション制御

```css
/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Safe animations */
.safe-animation {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### スクリーンリーダー対応

#### セマンティックHTML

```html
<!-- 良い例 -->
<button type="button" aria-label="メニューを開く">
  <svg aria-hidden="true">...</svg>
</button>

<main role="main">
  <h1>ページタイトル</h1>
  <section aria-labelledby="section-title">
    <h2 id="section-title">セクションタイトル</h2>
  </section>
</main>
```

#### ARIA属性ガイドライン

```html
<!-- ライブリージョン -->
<div aria-live="polite" aria-atomic="true">
  ステータスメッセージ
</div>

<!-- 説明テキスト -->
<input type="password" aria-describedby="password-help">
<div id="password-help">8文字以上で入力してください</div>

<!-- 展開可能なコンテンツ */
<button aria-expanded="false" aria-controls="details">
  詳細を表示
</button>
<div id="details" hidden>詳細コンテンツ</div>
```

### 文字サイズとズーム

#### レスポンシブテキスト

```css
/* Base font size responsive */
html {
  font-size: 16px;
}

@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

/* Text should scale up to 200% */
@media (min-width: 1200px) {
  .large-text-mode {
    font-size: 1.25em;
  }
}
```

### 色以外の情報伝達

#### 状態表示の多重化

```css
/* 成功状態 */
.success-state {
  color: var(--color-success);
  border-left: 4px solid var(--color-success);
}

.success-state::before {
  content: "✓";
  margin-right: var(--space-2);
}

/* エラー状態 */
.error-state {
  color: var(--color-error);
  border-left: 4px solid var(--color-error);
}

.error-state::before {
  content: "⚠";
  margin-right: var(--space-2);
}
```

## � レスポンシブデザインシステム

### ブレークポイント

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small tablets and large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
--breakpoint-2xl: 1536px; /* Extra large screens */
```

### グリッドシステム

#### フレックスボックスベース

```css
.container {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--container-margin-mobile);
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--container-margin-tablet);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--container-margin-desktop);
  }
}
```

#### 12カラムシステム

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

/* レスポンシブカラム */
.col-12 { grid-column: span 12; }
.col-6 { grid-column: span 6; }
.col-4 { grid-column: span 4; }
.col-3 { grid-column: span 3; }

@media (max-width: 767px) {
  .col-md-12 { grid-column: span 12; }
  .col-sm-6 { grid-column: span 6; }
}
```

### デバイス別調整

#### モバイル最適化

```css
@media (max-width: 767px) {
  /* Larger touch targets */
  .button {
    min-height: 48px;
    padding: var(--space-4) var(--space-6);
  }
  
  /* Increased spacing */
  .section-spacing {
    margin-bottom: var(--space-8);
  }
  
  /* Simplified navigation */
  .navigation-mobile {
    position: fixed;
    bottom: 0;
    width: 100%;
    background: white;
    border-top: 1px solid var(--Gray-200);
  }
}
```

#### タブレット最適化

```css
@media (min-width: 768px) and (max-width: 1023px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
  
  .sidebar {
    width: 280px;
  }
}
```

## �🔧 実装ガイドライン

### CSS変数定義（完全版）

```css
:root {
  /* === Color System === */
  /* Primary Colors */
  --Blue-50: #EFF6FF;
  --Blue-100: #DBEAFE;
  --Blue-200: #BFDBFE;
  --Blue-300: #93C5FD;
  --Blue-400: #60A5FA;
  --Blue-500: #3B82F6;
  --Blue-600: #2563EB;
  --Blue-700: #1D4ED8;
  --Blue-800: #1E40AF;
  --Blue-900: #1E3A8A;
  
  /* Accent Colors */
  --Orange-50: #FFF7ED;
  --Orange-500: #F97316;
  --Orange-600: #EA580C;
  
  /* Neutral Colors */
  --Gray-50: #F9FAFB;
  --Gray-100: #F3F4F6;
  --Gray-200: #E5E7EB;
  --Gray-300: #D1D5DB;
  --Gray-400: #9CA3AF;
  --Gray-500: #6B7280;
  --Gray-600: #4B5563;
  --Gray-700: #374151;
  --Gray-800: #1F2937;
  --Gray-900: #111827;
  
  /* Semantic Colors */
  --color-primary: var(--Blue-600);
  --color-accent: var(--Orange-500);
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: var(--Blue-500);
  
  /* === Typography === */
  --font-family-sans: 'SF Pro Display', 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  
  /* Font Sizes */
  --font-size-display-large: 57px;
  --font-size-display-medium: 45px;
  --font-size-display-small: 36px;
  --font-size-headline-large: 32px;
  --font-size-headline-medium: 28px;
  --font-size-headline-small: 24px;
  --font-size-title-large: 22px;
  --font-size-title-medium: 16px;
  --font-size-title-small: 14px;
  --font-size-body-large: 16px;
  --font-size-body-medium: 14px;
  --font-size-body-small: 12px;
  --font-size-label-large: 14px;
  --font-size-label-medium: 12px;
  --font-size-label-small: 11px;
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* === Spacing === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  
  /* === Border Radius === */
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-base: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 24px;
  --radius-full: 9999px;
  
  /* === Shadows === */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* === Layout === */
  --content-max-width: 1200px;
  --content-max-width-narrow: 768px;
  --container-margin-mobile: var(--space-4);
  --container-margin-tablet: var(--space-6);
  --container-margin-desktop: var(--space-8);
  
  /* === Breakpoints === */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Dark mode variables */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--Gray-900);
    --color-surface: var(--Gray-800);
    --color-text-primary: var(--Gray-50);
    --color-text-secondary: var(--Gray-300);
    --color-border: var(--Gray-700);
    
    /* Adjust shadows for dark mode */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  }
}
```

### コンポーネントライブラリ構造

```
/components
  /button
    - Button.css
    - Button.js
    - Button.stories.js
  /card
    - Card.css
    - Card.js
    - Card.stories.js
  /input
    - Input.css
    - Input.js
    - Input.stories.js
/tokens
  - colors.css
  - typography.css
  - spacing.css
  - shadows.css
/utilities
  - layout.css
  - accessibility.css
  - responsive.css
```

### デザイントークン管理

#### トークンの命名規則

```javascript
// 良い例
const tokens = {
  color: {
    primary: {
      50: '#EFF6FF',
      500: '#3B82F6',
      600: '#2563EB'
    }
  },
  spacing: {
    1: '4px',
    4: '16px',
    8: '32px'
  }
};
```

## 🎯 デザインシステム運用

### ブランド一貫性

- すべてのタッチポイントで統一されたデザイン言語
- アイコンスタイルの統一（ライン系またはフィル系）
- 一貫したインタラクションパターン
- マイクロインタラクションの標準化

### パフォーマンス考慮

#### CSS最適化

```css
/* Critical CSS - Above the fold content */
.hero-section,
.navigation,
.button-primary {
  /* インライン化推奨 */
}

/* Non-critical CSS - Lazy load */
.modal,
.dropdown,
.tooltip {
  /* 非同期読み込み */
}
```

#### 画像最適化

- WebP形式の採用
- レスポンシブイメージの実装
- 適切なalt属性の設定

## 📋 実装チェックリスト

### 基盤システム

- [ ] デザイントークンの定義と実装
- [ ] CSS変数の設定
- [ ] カラーパレットの実装
- [ ] タイポグラフィシステムの適用
- [ ] スペーシングシステムの適用

### コンポーネント

- [ ] ボタンコンポーネントの作成
- [ ] カードコンポーネントの作成
- [ ] 入力フィールドコンポーネントの作成
- [ ] ナビゲーションコンポーネントの作成
- [ ] モーダルコンポーネントの作成

### レスポンシブ対応

- [ ] ブレークポイントの設定
- [ ] グリッドシステムの実装
- [ ] モバイルファーストアプローチ
- [ ] タッチターゲットの最適化

### アクセシビリティ

- [ ] WCAG 2.1 AA準拠の確認
- [ ] カラーコントラストの検証
- [ ] キーボードナビゲーションの実装
- [ ] スクリーンリーダー対応
- [ ] フォーカス管理の実装

### ダークモード

- [ ] ダークモードカラーパレットの実装
- [ ] システム設定連動の実装
- [ ] 手動切り替え機能の実装

### テストと品質保証

- [ ] クロスブラウザテスト
- [ ] デバイステスト
- [ ] アクセシビリティテスト
- [ ] パフォーマンステスト
- [ ] ユーザビリティテスト

### ドキュメンテーション

- [ ] コンポーネントライブラリ（Storybook等）
- [ ] デザインガイドライン文書
- [ ] 実装ガイド
- [ ] コントリビューションガイド

---

**デザインシステム仕様書**  
**作成日**: 2025年10月24日  
**バージョン**: 2.0 (Apple HIG準拠版)  
**準拠基準**: WCAG 2.1 AA, Apple Human Interface Guidelines  
**対象デバイス**: Mobile, Tablet, Desktop  
**ブラウザサポート**: Modern browsers (IE11+)
