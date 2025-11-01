import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { apiService } from '../services/api';
import { Portfolio, PortfolioEntry, Stock, AnalysisResult } from '../types/index';

interface PortfolioEntryWithDetails extends PortfolioEntry {
  stock?: Stock;
  analysis?: AnalysisResult;
}

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [entries, setEntries] = useState<PortfolioEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        setError(null);

        // ポートフォリオ一覧取得
        const portfoliosResponse = await apiService.getPortfolios();
        if (portfoliosResponse.data) {
          setPortfolios(portfoliosResponse.data);

          // 最初のポートフォリオを選択
          if (portfoliosResponse.data.length > 0) {
            // エントリ取得（簡略版：全エントリ取得後にフィルタリング）
            // 実装では、バックエンド側でポートフォリオ別エントリ取得エンドポイント追加が必要
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ポートフォリオの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleDeleteEntry = async (entryId: number) => {
    try {
      await apiService.deletePortfolioEntry(entryId);
      setEntries(entries.filter((e) => e.id !== entryId));
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エントリ削除に失敗しました');
    }
  };

  // 評価損益計算
  const calculatePnL = (entry: PortfolioEntryWithDetails) => {
    if (!entry.analysis) return null;
    const currentValue = entry.analysis.currentPrice * entry.quantity;
    const costValue = entry.purchase_price * entry.quantity;
    const pnl = currentValue - costValue;
    const pnlPercent = ((pnl / costValue) * 100).toFixed(2);
    return {
      pnl: pnl.toFixed(0),
      pnlPercent,
      isPositive: pnl >= 0,
    };
  };

  // ポートフォリオ全体の成績計算
  const calculatePortfolioStats = () => {
    let totalCost = 0;
    let totalValue = 0;

    entries.forEach((entry) => {
      totalCost += entry.purchase_price * entry.quantity;
      if (entry.analysis) {
        totalValue += entry.analysis.currentPrice * entry.quantity;
      }
    });

    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(2) : '0.00';

    return {
      totalCost: totalCost.toFixed(0),
      totalValue: totalValue.toFixed(0),
      totalPnL: totalPnL.toFixed(0),
      totalPnLPercent,
      isPositive: totalPnL >= 0,
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const stats = calculatePortfolioStats();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {portfolios.length === 0 ? (
        <Alert severity="info">
          ポートフォリオが作成されていません。銘柄詳細ページからポートフォリオに追加してください。
        </Alert>
      ) : (
        <>
          {/* ポートフォリオ成績サマリー */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Box sx={{ color: 'white' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                ポートフォリオ総合成績
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    総投資額
                  </Typography>
                  <Typography variant="h6">¥{Number(stats.totalCost).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    現在評価額
                  </Typography>
                  <Typography variant="h6">¥{Number(stats.totalValue).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    評価損益
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: stats.isPositive ? '#4caf50' : '#f44336', fontWeight: 'bold' }}
                  >
                    {stats.isPositive ? '+' : ''}¥{Number(stats.totalPnL).toLocaleString()} ({stats.totalPnLPercent}%)
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* ポートフォリオエントリテーブル */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>銘柄コード</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>銘柄名</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    数量
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    購入価格
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    現在価格
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    現在評価額
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    評価損益
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        ポートフォリオに銘柄が追加されていません
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => {
                    const pnl = calculatePnL(entry);
                    return (
                      <TableRow key={entry.id} hover>
                        <TableCell>{entry.stock?.symbol || 'N/A'}</TableCell>
                        <TableCell>{entry.stock?.name || 'N/A'}</TableCell>
                        <TableCell align="right">{entry.quantity}</TableCell>
                        <TableCell align="right">¥{entry.purchase_price.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          ¥{entry.analysis?.currentPrice.toLocaleString() || 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          ¥
                          {entry.analysis
                            ? (entry.analysis.currentPrice * entry.quantity).toLocaleString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: pnl?.isPositive ? '#4caf50' : '#f44336',
                            fontWeight: 'bold',
                          }}
                        >
                          {pnl ? `${pnl.isPositive ? '+' : ''}¥${Number(pnl.pnl).toLocaleString()} (${pnl.pnlPercent}%)` : 'N/A'}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeleteTargetId(entry.id);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            削除
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 削除確認ダイアログ */}
          <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
            <DialogTitle>削除確認</DialogTitle>
            <DialogContent>
              <Typography>このエントリを削除してもよろしいですか？</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteConfirmOpen(false)}>キャンセル</Button>
              <Button
                onClick={() => deleteTargetId && handleDeleteEntry(deleteTargetId)}
                color="error"
                variant="contained"
              >
                削除
              </Button>
            </DialogActions>
          </Dialog>

          {/* アクションボタン */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/stocks')}>
              銘柄一覧に戻る
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default PortfolioPage;
