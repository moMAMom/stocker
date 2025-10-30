/**
 * React メインアプリケーションコンポーネント
 * ルーティングと全体レイアウト
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/stocks" element={<div>Stocks Page</div>} />
        <Route path="/stocks/:id" element={<div>Stock Detail Page</div>} />
        <Route path="/portfolio" element={<div>Portfolio Page</div>} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
