/**
 * 銘柄一覧ページ
 * 全銘柄をテーブル表示し、フィルタ・ソート・ページネーション対応
 * 分析実行時は自動ポーリングで結果を更新
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
} from '../stores/slices/stocksSlice';
import {
  setMultipleAnalysisResults,
} from '../stores/slices/analysisSlice';
import type { RootState } from '../stores/rootReducer';
import apiService from '../services/api';

const StocksPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: stocks, loading, error } = useSelector(
    (state: RootState) => state.stocks
  );
  const analysisResults = useSelector(
    (state: RootState) => state.analysis.results
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50); // 1ページあたりの件数
  const [searchText, setSearchText] = useState('');
  const [totalCount, setTotalCount] = useState(0); // API から取得した全銘柄数
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    name: '',
    market: 'TSE',
    sector: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisStartTimeRef = useRef<number | null>(null);
  const pollingCountRef = useRef<number>(0);

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
        
        // 【重要】API レスポンスの pagination から全銘柄数を取得
        if (response.pagination && response.pagination.total) {
          setTotalCount(response.pagination.total);
          console.log(`📊 全銘柄数: ${response.pagination.total}, 取得件数: ${response.data?.length}`);
        } else {
          console.warn('⚠️ pagination 情報が見つかりません');
        }

        // 【パフォーマンス改善】
        // 初回ロード時は分析結果を取得しない
        // （全銘柄の分析結果を取得するとレート制限に引っかかる可能性がある）
        // ユーザーが「全銘柄を分析」ボタンを押す時に取得する
        // 分析結果はReduxから取得するため、ここでは設定不要

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

  const handleAnalyzeAll = async () => {
    if (stocks.length === 0) {
      alert('分析対象の銘柄がありません');
      return;
    }

    setIsAnalyzing(true);
    analysisStartTimeRef.current = Date.now();

    try {
      const stockIds = stocks.map(stock => stock.id);
      const response = await apiService.triggerAnalysis(stockIds);
      
      if (response.success) {
        alert('分析を開始しました。自動的に結果を更新します...');
        
        // 自動ポーリング開始（5秒ごとに状態確認、最大 10分間）
        const maxPollingDuration = 10 * 60 * 1000; // 10分
        const pollingInterval = 5000; // 5秒（高速ポーリングによるレート制限を回避）

        pollingIntervalRef.current = setInterval(async () => {
          try {
            // 【改善】全銘柄を順序付けてバッチ処理（3個ずつ、5秒ごと）
            const batchSize = 3; // 1回のポーリングで3個のみ取得
            const updatedResults: any[] = [];
            
            // 前回ポーリングからの続きを計算
            const currentBatchIndex = (pollingCountRef.current || 0);
            const batchStartIndex = (currentBatchIndex * batchSize) % stocks.length;
            const batchEndIndex = Math.min(batchStartIndex + batchSize, stocks.length);
            
            // 現在のバッチのみ取得（逐次実行）
            for (let i = batchStartIndex; i < batchEndIndex; i++) {
              try {
                const stock = stocks[i];
                const analysisResp = await apiService.getAnalysis(stock.id);
                if (analysisResp.data) {
                  updatedResults.push(analysisResp.data);
                }
              } catch (error) {
                // エラーでも次に進む
                console.log(`Stock ${i} analysis failed, continuing...`);
              }
            }
            
            pollingCountRef.current = (currentBatchIndex + 1);
            
            // Reduxに分析結果を保存
            if (updatedResults.length > 0) {
              dispatch(setMultipleAnalysisResults(updatedResults));
            }

            // ポーリング時間制限チェック
            const elapsedTime = Date.now() - (analysisStartTimeRef.current || Date.now());
            if (elapsedTime > maxPollingDuration) {
              clearInterval(pollingIntervalRef.current!);
              pollingIntervalRef.current = null;
              setIsAnalyzing(false);
              alert('分析がタイムアウトしました。');
            }
          } catch (error) {
            console.error('ポーリング中にエラー:', error);
          }
        }, pollingInterval);

        // 【修正】179銘柄を5秒ごと3個ずつ処理すると約300秒必要
        // タイムアウト時間を30秒→350秒(5分50秒)に延長
        setTimeout(() => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            setIsAnalyzing(false);
            alert('分析完了。最新の結果を表示しています。');
          }
        }, 350000);

      } else {
        alert(`エラー: ${response.error || '分析の実行に失敗しました'}`);
        setIsAnalyzing(false);
      }
    } catch (err) {
      alert(`エラー: ${err instanceof Error ? err.message : '分析の実行に失敗しました'}`);
      setIsAnalyzing(false);
    }
  };

  // コンポーネントアンマウント時にポーリングをクリーンアップ
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing || stocks.length === 0}
          >
            {isAnalyzing ? '分析中...' : '全銘柄を分析'}
          </Button>
          <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
            新規銘柄追加
          </Button>
        </Box>
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
              {stocks.map((stock) => {
                const analysis = analysisResults[stock.id];
                return (
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
                      {analysis ? (
                        <Chip
                          label={getSignalLabel(analysis.signal)}
                          color={getSignalColor(analysis.signal) as any}
                          size="small"
                        />
                      ) : (
                        <span>未分析</span>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {analysis ? `${analysis.score.toFixed(1)}/100` : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {analysis ? `${(analysis.confidence * 100).toFixed(0)}%` : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {analysis ? `¥${analysis.current_price.toLocaleString()}` : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalCount} // Redux の items.length ではなく、API から取得した全銘柄数を使用
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
