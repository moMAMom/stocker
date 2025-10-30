# PayPay Investment Helper Project Overview

## Project Purpose
このプロジェクトは、テクニカル分析に基づく投資判断支援Webアプリケーションです。ユーザーが事前に準備した日本株の銘柄リストに対して、テクニカル指標（移動平均線、RSI、MACDなど）を自動計算して買い/売り判断を行い、投資判断を支援します。

## Core Features
- 銘柄管理: ユーザーが管理したい銘柄をリスト化
- テクニカル分析: 複数指標の自動計算
- 買い/売り判定: 確定的なシグナル出力
- ダッシュボード: 分析結果の可視化
- ポートフォリオ追跡: 購入銘柄の成績管理

## Tech Stack
- Frontend: React 18 + Vite + TypeScript + Redux Toolkit + Material-UI
- Backend: Node.js + Express.js + TypeScript + Prisma ORM
- Database: PostgreSQL
- Analysis Engine: Python 3.11 + yfinance + ta-lib
- Infrastructure: Docker + Docker Compose

## Project Structure
- backend/: Node.js backend with API controllers, services, middleware
- frontend/: React frontend with components, pages, stores
- analysis/: Python analysis engine with indicators, data fetching, backtesting
- Do/: Design documents
- docs/, logs/, config/, data/, onetime/: Utilities and docs

## Project Rules
- File naming: kebab-case for files, PascalCase for classes/types
- Coding principles: Single responsibility, DRY, KISS
- Languages: Japanese for comments/docs, English for code strings
- Formatting: ESLint + Prettier
- Testing: Unit tests with 80% coverage target
- Git commits: [<type>] <subject> format

## Development Environment
- Development: Local Docker Compose
- Production: TBD (Heroku/AWS)
- CI/CD: GitHub Actions with tests, security scans