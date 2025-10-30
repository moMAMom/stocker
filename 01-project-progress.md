# プロジェクト進捗

**作成日　25/10/30**
**更新日　25/10/30 14:23**

## 完了タスク

### フェーズ 1：環境構築と基盤実装

- プロジェクト管理ファイル作成（25/10/30）
- プロジェクトディレクトリ構造初期化（25/10/30）
- バックエンド基本設定完了（tsconfig.json、ESLint、Prettier、src/index.ts、logger.ts）（25/10/30）
- フロントエンド基本設定完了（tsconfig.json、Vite設定）（25/10/30）
- Docker環境設定完了（docker-compose.yml、全Dockerfile）（25/10/30）
- Prismaスキーマ設計完了（Stock、TechnicalIndicator、AnalysisResult、Portfolio、PortfolioEntry）（25/10/30）

## 現在の課題

### 課題1: npm依存関係のインストール未実施

- **問題:** backend、frontend の依存関係がまだインストールされていない
- **影響:** Docker環境での起動時にビルドエラーが発生する可能性
- **対策:** docker-compose upで自動的にインストールされる。初回起動時に確認。

### 課題2: Prismaマイグレーション未実行

- **問題:** Prismaスキーマは定義されたがDBマイグレーションが未実行
- **影響:** テーブルが実際に作成されていない
- **対策:** Docker環境起動後に `npx prisma migrate dev` を実行

## 次のステップ

### フェーズ 1: 環境構築と基盤実装 進捗状況

#### 完了済みタスク

- [x] **T002** .env.example と環境変数テンプレート作成
- [x] **T003** Docker + Docker Compose セットアップ
- [x] **T005** Node.js + Express.js プロジェクト初期化
- [x] **T006** TypeScript 設定（backend）
- [x] **T007** ESLint + Prettier 設定（backend）
- [x] **T008** Express.js 基本サーバー実装 + ロギング完成
- [x] **T009** React + Vite プロジェクト初期化
- [x] **T010** TypeScript 設定（frontend）
- [x] **T012** Material-UI + Recharts ライブラリ依存関係定義
- [x] **T014** Prisma セットアップ
- [x] **T015** Prisma スキーマ設計・実装（stocks テーブル）
- [x] **T016** Prisma スキーマ設計・実装（analysis_results テーブル）
- [x] **T017** Prisma スキーマ設計・実装（technical_indicators, portfolio テーブル）

#### 実行予定タスク

- [ ] **T004** ローカル開発環境で Docker-compose が正常に起動することを確認
- [ ] **T011** Redux Toolkit セットアップ
- [ ] **T013** PostgreSQL 初期化とコンテナ確認
- [ ] **T018** Prisma マイグレーション実行（初期化）
- [ ] **T019** Prisma シードデータ（ダミー銘柄）作成（オプション）

## マイルストーン管理

| フェーズ | マイルストーン | 目標完了日 | 状態 |
|---------|-------------|---------|------|
| フェーズ1 | Docker環境・DB準備完了 | 25/11/06 | 進行中（85%） |
| フェーズ2 | バックエンドAPI完全実装・テスト完了 | 25/11/20 | 開始前 |
| フェーズ3 | 分析エンジン・スケジューラ動作確認 | 25/12/04 | 開始前 |
| フェーズ4 | フロントエンドUI完成・API連携確認 | 25/12/18 | 開始前 |
| フェーズ5 | 統合テスト完了・本番デプロイ | 26/01/01 | 開始前 |

## 技術スタック確認

- **バックエンド**: Node.js + Express.js + TypeScript
- **フロントエンド**: React + Vite + TypeScript + Redux Toolkit
- **データベース**: PostgreSQL + Prisma ORM
- **分析エンジン**: Python 3.11 + yfinance + ta-lib
- **インフラ**: Docker + Docker Compose
- **デプロイ**: TBD（Heroku / AWS 検討中）

## リスク管理

| リスク | 影響度 | 現在の状態 | 対策 |
|------|------|---------|------|
| yfinance API の変更・廃止 | 中 | 監視中 | 国内証券会社 API への切り替え候補リスト準備 |
| テクニカル指標の精度不足 | 高 | 未検証 | フェーズ3で早期バックテスト実施 |
| DB スケーラビリティ不足 | 中 | 検討中 | 初期版はシングルサーバー、将来レプリケーション導入 |
| セキュリティ脆弱性発見 | 高 | 未実施 | 定期的な脆弱性スキャン、依存ライブラリ更新 |
| スケジューラの実行失敗 | 中 | 未実装 | リトライロジック、エラーアラート設定 |

## メモ・その他

- プロジェクト全体推定工期：7-11週間（約2-3ヶ月）
- 各タスクの詳細内容は `/Do/04_Tasks.md` を参照
- プロジェクトルール・ファイル構造は `00-project-rule.md` を参照
- フェーズ1は85%完了、Redux Toolkit セットアップ完了
- 残りは T004（Docker動作確認）、T011（Redux完成）、T013（PostgreSQL確認）、T018-T019（マイグレーション）
- フロントエンド基本構造（Redux + React Router）完成、バックエンド基本実装完成
