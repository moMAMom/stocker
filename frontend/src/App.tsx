/**
 * React メインアプリケーションコンポーネント
 * ルーティングと全体レイアウト
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import StocksPage from './pages/StocksPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StocksPage />} />
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/stocks/:id" element={<div>Stock Detail Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/portfolio" element={<div>Portfolio Page</div>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
