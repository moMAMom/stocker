/**
 * React メインアプリケーションコンポーネント
 * ルーティングと全体レイアウト
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import StocksPage from './pages/StocksPage';
import StockDetailPage from './pages/StockDetailPage';
import PortfolioPage from './pages/PortfolioPage';

const App: React.FC = () => {
  console.log('App component rendered');
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StocksPage />} />
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/stocks/:id" element={<StockDetailPage />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
