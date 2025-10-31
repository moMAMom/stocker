#!/usr/bin/env python3
"""
分析機能の動作確認テストスクリプト

このスクリプトは、修正後の分析機能が正しく動作するか確認します。
"""

import time
import requests
from datetime import datetime

# 設定
BACKEND_URL = "http://localhost:3000"
ANALYSIS_URL = "http://localhost:5000"

def print_header(title):
    """テストセクションのヘッダーを出力"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_health_checks():
    """ヘルスチェックテスト"""
    print_header("ヘルスチェック")
    
    # バックエンド
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        print(f"✅ バックエンド: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ バックエンド: {str(e)}")
        return False
    
    # 分析エンジン
    try:
        response = requests.get(f"{ANALYSIS_URL}/health", timeout=5)
        print(f"✅ 分析エンジン: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ 分析エンジン: {str(e)}")
        return False
    
    return True

def test_get_stocks():
    """銘柄一覧取得テスト"""
    print_header("銘柄一覧取得")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/stocks?limit=5", timeout=10)
        data = response.json()
        
        if response.status_code == 200:
            stocks = data.get('data', [])
            print(f"✅ 銘柄一覧取得成功: {len(stocks)}件取得")
            if stocks:
                print(f"   例: {stocks[0].get('name')} ({stocks[0].get('symbol')})")
                return stocks[:3]  # 最初の3銘柄を返す
        else:
            print(f"❌ 銘柄一覧取得失敗: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ エラー: {str(e)}")
        return []

def test_trigger_analysis(stock_ids):
    """分析トリガーテスト"""
    print_header("分析トリガー（非同期処理）")
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/api/analysis/trigger",
            json={"stockIds": stock_ids},
            timeout=10  # 即座にレスポンスが返るはず
        )
        elapsed = time.time() - start_time
        
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ 分析トリガー成功: {response.status_code}")
            print(f"   レスポンス時間: {elapsed:.2f}秒")
            print(f"   メッセージ: {data.get('message')}")
            print(f"   対象銘柄数: {data.get('analysis_count')}")
            print(f"   ステータス: {data.get('status')}")
            
            if elapsed < 2:
                print(f"   ✅ 即座にレスポンスが返っています（{elapsed:.2f}秒 < 2秒）")
            else:
                print(f"   ⚠️  レスポンスが遅い可能性があります（{elapsed:.2f}秒）")
            
            return True
        else:
            print(f"❌ 分析トリガー失敗: {response.status_code}")
            print(f"   エラー: {data}")
            return False
    except Exception as e:
        print(f"❌ エラー: {str(e)}")
        return False

def test_get_analysis_result(stock_id, max_wait=30):
    """分析結果取得テスト（ポーリング）"""
    print_header(f"分析結果取得（銘柄ID: {stock_id}）")
    
    print(f"バックグラウンド処理の完了を待機中...")
    start_time = time.time()
    
    for attempt in range(max_wait):
        try:
            response = requests.get(
                f"{BACKEND_URL}/api/analysis/{stock_id}",
                timeout=5
            )
            
            if response.status_code == 200:
                elapsed = time.time() - start_time
                data = response.json()
                
                print(f"\n✅ 分析結果取得成功（待機時間: {elapsed:.1f}秒）")
                print(f"   シグナル: {data.get('data', {}).get('signal')}")
                print(f"   スコア: {data.get('data', {}).get('score')}")
                print(f"   現在価格: {data.get('data', {}).get('currentPrice')}")
                
                indicators = data.get('data', {}).get('indicators', {})
                if indicators:
                    print(f"   指標:")
                    print(f"     - MA5: {indicators.get('ma_5')}")
                    print(f"     - MA20: {indicators.get('ma_20')}")
                    print(f"     - RSI: {indicators.get('rsi_14')}")
                    print(f"     - MACD: {indicators.get('macd')}")
                
                return True
            elif response.status_code == 404:
                # まだ分析結果が保存されていない
                print(f".", end="", flush=True)
                time.sleep(1)
            else:
                print(f"\n❌ 予期しないステータスコード: {response.status_code}")
                return False
        except Exception as e:
            print(f"\n❌ エラー: {str(e)}")
            return False
    
    print(f"\n❌ タイムアウト: {max_wait}秒以内に結果が取得できませんでした")
    return False

def test_batch_analysis():
    """バッチ分析テスト（Python直接呼び出し）"""
    print_header("バッチ分析（Python直接）")
    
    try:
        response = requests.post(
            f"{ANALYSIS_URL}/analyze/batch",
            json={
                "tickers": ["7203.T", "6758.T"],  # トヨタ、ソニー
                "period": "1y",
                "save_to_backend": True
            },
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ バッチ分析成功")
            print(f"   分析銘柄数: {len(data)}")
            for ticker, result in list(data.items())[:2]:
                print(f"   - {ticker}: {result.get('signal')} (スコア: {result.get('score')})")
            return True
        else:
            print(f"❌ バッチ分析失敗: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ エラー: {str(e)}")
        return False

def main():
    """メイン関数"""
    print("\n" + "="*60)
    print("  分析機能 動作確認テスト")
    print("  作成日: 2025-10-31")
    print("="*60)
    
    results = []
    
    # 1. ヘルスチェック
    results.append(("ヘルスチェック", test_health_checks()))
    
    if not results[-1][1]:
        print("\n❌ サービスが起動していないため、テストを中断します")
        return
    
    # 2. 銘柄一覧取得
    stocks = test_get_stocks()
    results.append(("銘柄一覧取得", len(stocks) > 0))
    
    if not stocks:
        print("\n⚠️  銘柄データがないため、残りのテストをスキップします")
        return
    
    # 3. 分析トリガー
    stock_ids = [stock['id'] for stock in stocks]
    results.append(("分析トリガー", test_trigger_analysis(stock_ids)))
    
    # 4. 分析結果取得（最初の銘柄のみ）
    if stock_ids:
        results.append(("分析結果取得", test_get_analysis_result(stock_ids[0], max_wait=30)))
    
    # 5. バッチ分析（オプション）
    # results.append(("バッチ分析", test_batch_analysis()))
    
    # 結果サマリー
    print_header("テスト結果サマリー")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ 成功" if result else "❌ 失敗"
        print(f"  {status}: {test_name}")
    
    print(f"\n合計: {passed}/{total} テスト成功 ({passed*100//total if total > 0 else 0}%)")
    
    if passed == total:
        print("\n🎉 全てのテストが成功しました！")
    else:
        print("\n⚠️  一部のテストが失敗しました")

if __name__ == "__main__":
    main()
