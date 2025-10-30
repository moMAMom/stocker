import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  TextField,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/api';
import { Stock, AnalysisResult } from '../types/index';

interface StockDetailPageProps {}

const StockDetailPage: React.FC<StockDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPortfolioDialog, setOpenPortfolioDialog] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(0);

  useEffect(() => {
    const fetchStockDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('銘柄IDが指定されていません');
          return;
        }

        const stockId = Number(id);

        // 銘柄情報取得
        const stockResponse = await apiService.getStock(stockId);
        if (stockResponse.data) {
          setStock(stockResponse.data);
        }

        // 分析結果取得
        const analysisResponse = await apiService.getAnalysis(stockId);
        if (analysisResponse.data) {
          setAnalysis(analysisResponse.data);
        }

        // 過去の分析履歴取得
        const historyResponse = await apiService.getAnalysisHistory(stockId, {
          days: 30,
        });
        if (historyResponse.data) {
          setHistory(historyResponse.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '銘柄情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetail();
  }, [id]);

  const handleAddToPortfolio = async () => {
    try {
      if (!stock) return;

      // ポートフォリオ作成（または既存ポートフォリオに追加）
      // 実装では最初のポートフォリオを取得して追加
      const portfoliosResponse = await apiService.getPortfolios();
      if (!portfoliosResponse.data || portfoliosResponse.data.length === 0) {
        setError('ポートフォリオが存在しません。ポートフォリオを作成してください。');
        return;
      }

      const portfolio = portfoliosResponse.data[0];
      await apiService.createPortfolioEntry({
        portfolio_id: portfolio.id,
        stock_id: stock.id,
        quantity,
        purchase_price: entryPrice,
        purchase_date: new Date().toISOString().split('T')[0],
      });

      setOpenPortfolioDialog(false);
      setError(null);
      // ポートフォリオページへ遷移
      navigate('/portfolio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ポートフォリオへの追加に失敗しました');
    }
  };

  // シグナルの色分け
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case '買い':
        return 'success';
      case '売り':
        return 'error';
      case '保有':
        return 'warning';
      default:
        return 'default';
    }
  };

  // シグナルの背景色
  const getSignalBgColor = (signal: string) => {
    switch (signal) {
      case '買い':
        return '#4caf50';
      case '売り':
        return '#f44336';
      case '保有':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/stocks')} sx={{ mt: 2 }}>
          銘柄一覧に戻る
        </Button>
      </Container>
    );
  }

  if (!stock || !analysis) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">銘柄情報が見つかりません</Alert>
        <Button onClick={() => navigate('/stocks')} sx={{ mt: 2 }}>
          銘柄一覧に戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ヘッダー情報 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {stock.symbol} - {stock.name}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              業種: {stock.sector} | 市場: {stock.market}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              label={analysis.signal}
              sx={{
                backgroundColor: getSignalBgColor(analysis.signal),
                color: 'white',
                fontSize: '1rem',
                height: 'auto',
                padding: '8px 16px',
              }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>
              スコア: {analysis.score.toFixed(2)}/100
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              信頼度: {(analysis.confidence * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* テクニカル指標情報 */}
      {analysis && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  移動平均線 (MA)
                </Typography>
                <Typography variant="h6">MA5: {analysis.ma_5?.toFixed(2)}</Typography>
                <Typography variant="body2">MA20: {analysis.ma_20?.toFixed(2)}</Typography>
                <Typography variant="body2">MA50: {analysis.ma_50?.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  RSI（相対力指数）
                </Typography>
                <Typography variant="h6">{analysis.rsi_14?.toFixed(2)}</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: analysis.rsi_14! > 70 ? '#f44336' : analysis.rsi_14! < 30 ? '#4caf50' : '#ff9800' }}>
                  {analysis.rsi_14! > 70 ? '過買い' : analysis.rsi_14! < 30 ? '過売り' : 'ニュートラル'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  MACD
                </Typography>
                <Typography variant="h6">MACD: {analysis.macd?.toFixed(4)}</Typography>
                <Typography variant="body2">Signal: {analysis.macd_signal?.toFixed(4)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  現在の価格
                </Typography>
                <Typography variant="h6">¥{analysis.current_price?.toFixed(2)}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  更新: {new Date(analysis.updated_at).toLocaleDateString('ja-JP')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 分析根拠 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          買い/売り判定根拠
        </Typography>
        <Typography variant="body1">{analysis.reason || '分析情報はありません'}</Typography>
      </Paper>

      {/* チャート表示 - 過去30日の価格推移 */}
      {history && history.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            過去30日の判定推移
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="created_at"
                tickFormatter={(date: string) => new Date(date).toLocaleDateString('ja-JP')}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                labelFormatter={(date: string) => new Date(date).toLocaleDateString('ja-JP')}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="score" stroke="#8884d8" name="スコア" />
              <Line yAxisId="right" type="monotone" dataKey="current_price" stroke="#82ca9d" name="価格（円）" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* アクションボタン */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/stocks')}>
          銘柄一覧に戻る
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenPortfolioDialog(true)}
        >
          ポートフォリオに追加
        </Button>
      </Box>

      {/* ポートフォリオ追加ダイアログ */}
      <Dialog open={openPortfolioDialog} onClose={() => setOpenPortfolioDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            ポートフォリオに追加
          </Typography>
          <TextField
            fullWidth
            label="数量（株）"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="購入価格（円）"
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpenPortfolioDialog(false)}>キャンセル</Button>
            <Button variant="contained" color="primary" onClick={handleAddToPortfolio}>
              追加
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
};

export default StockDetailPage;
