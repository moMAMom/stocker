/**
 * 銘柄一覧ページ
 * 全銘柄をテーブル表示し、フィルタ・ソート・ページネーション対応
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStocksStart,
  fetchStocksSuccess,
  fetchStocksError,
  setFilter,
  setSort,
} from '../stores/slices/stocksSlice';
import type { RootState } from '../stores/rootReducer';
import apiService from '../services/api';
import type { Stock, AnalysisResult } from '../types';

interface StockWithAnalysis extends Stock {
  analysis?: AnalysisResult;
}

const StocksPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, filter, sort } = useSelector(
    (state: RootState) => state.stocks
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [stocksWithAnalysis, setStocksWithAnalysis] = useState<StockWithAnalysis[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    name: '',
    market: 'TSE',
    sector: '',
  });

  // 銘柄一覧を取得
  const fetchStocks = useCallback(async () => {
    dispatch(fetchStocksStart());
    try {
      const response = await apiService.getStocks({
        page: page + 1,
        limit: rowsPerPage,
        search: searchText,
      });

      if (response.success) {
        dispatch(fetchStocksSuccess(response.data || []));

        // 各銘柄の分析結果を取得
        if (response.data) {
          const stocksData = await Promise.all(
            response.data.map(async (stock) => {
              try {
                const analysisResp = await apiService.getAnalysis(stock.id);
                return {
                  ...stock,
                  analysis: analysisResp.data,
                };
              } catch {
                return stock;
              }
            })
          );
          setStocksWithAnalysis(stocksData);
        }
      } else {
        dispatch(fetchStocksError(response.error || '不明なエラー'));
      }
    } catch (err) {
      dispatch(fetchStocksError(err instanceof Error ? err.message : '銘柄の取得に失敗'));
    }
  }, [dispatch, page, rowsPerPage, searchText]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(0);
  };

  const handleAddStock = async () => {
    try {
      const response = await apiService.createStock(newStock);
      if (response.success) {
        setNewStock({ symbol: '', name: '', market: 'TSE', sector: '' });
        setOpenAddDialog(false);
        fetchStocks();
      }
    } catch (err) {
      alert('銘柄追加に失敗しました');
    }
  };

  const getSignalColor = (signal: string | undefined) => {
    switch (signal) {
      case 'BUY':
        return 'success';
      case 'SELL':
        return 'error';
      case 'HOLD':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getSignalLabel = (signal: string | undefined) => {
    switch (signal) {
      case 'BUY':
        return '買い';
      case 'SELL':
        return '売り';
      case 'HOLD':
        return '保有';
      default:
        return 'N/A';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <TextField
          label="銘柄を検索"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ minWidth: 250 }}
          placeholder="銘柄コード、名前で検索"
        />
        <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
          新規銘柄追加
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>コード</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>銘柄名</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>市場</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>業種</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>シグナル</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  スコア
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  信頼度
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  現在価格
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocksWithAnalysis.map((stock) => (
                <TableRow
                  key={stock.id}
                  hover
                  onClick={() => navigate(`/stocks/${stock.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{stock.symbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>{stock.market}</TableCell>
                  <TableCell>{stock.sector || 'N/A'}</TableCell>
                  <TableCell>
                    {stock.analysis ? (
                      <Chip
                        label={getSignalLabel(stock.analysis.signal)}
                        color={getSignalColor(stock.analysis.signal) as any}
                        size="small"
                      />
                    ) : (
                      <span>未分析</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {stock.analysis ? `${stock.analysis.score.toFixed(1)}/100` : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {stock.analysis ? `${(stock.analysis.confidence * 100).toFixed(0)}%` : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {stock.analysis ? `¥${stock.analysis.current_price.toLocaleString()}` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={items.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="1ページあたりの行数："
          />
        </TableContainer>
      )}

      {/* 新規銘柄追加ダイアログ */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新規銘柄追加</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="銘柄コード"
            value={newStock.symbol}
            onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
            fullWidth
          />
          <TextField
            label="銘柄名"
            value={newStock.name}
            onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="市場"
            value={newStock.market}
            onChange={(e) => setNewStock({ ...newStock, market: e.target.value })}
            fullWidth
          />
          <TextField
            label="業種"
            value={newStock.sector}
            onChange={(e) => setNewStock({ ...newStock, sector: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>キャンセル</Button>
          <Button onClick={handleAddStock} variant="contained">
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StocksPage;
