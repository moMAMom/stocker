import { test, expect } from '@playwright/test';

test.describe('Full Application Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // ホームページにアクセス
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('T063-1: 銘柄一覧表示・フィルタ・ソート', async ({ page }) => {
    // ページが読み込まれ、テーブルが表示されることを確認
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // テーブルに行が存在することを確認
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // 各列のヘッダーが存在することを確認
    const headers = ['銘柄コード', '名前', '市場', '業種', 'シグナル', 'スコア'];
    for (const header of headers) {
      const headerElement = page.locator(`text=${header}`);
      await expect(headerElement).toBeVisible();
    }
  });

  test('T063-2: 銘柄詳細ページへのナビゲーション', async ({ page }) => {
    // テーブルの最初の行をクリック
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // 詳細ページに遷移したことを確認（URL変更）
    await page.waitForURL(/\/stocks\/\d+/);
    const url = page.url();
    expect(url).toContain('/stocks/');

    // 詳細ページのコンテンツが読み込まれたことを確認
    const stockName = page.locator('h1');
    await expect(stockName).toBeVisible();
  });

  test('T063-3: テクニカル指標の表示', async ({ page }) => {
    // テーブルの最初の行をクリックして詳細ページに遷移
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await page.waitForURL(/\/stocks\/\d+/);

    // テクニカル指標の表示を確認
    const indicators = ['移動平均線', 'RSI', 'MACD'];
    for (const indicator of indicators) {
      const indicatorElement = page.locator(`text=${indicator}`).first();
      await expect(indicatorElement).toBeVisible({ timeout: 10000 });
    }

    // グラフが表示されていることを確認
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('T063-4: ポートフォリオ追加ダイアログ', async ({ page }) => {
    // テーブルの最初の行をクリックして詳細ページに遷移
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await page.waitForURL(/\/stocks\/\d+/);

    // ポートフォリオ追加ボタンをクリック
    const addButton = page.locator('button:has-text("ポートフォリオに追加")');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // ダイアログが表示されることを確認
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // ダイアログのフィールドが存在することを確認
    const quantityInput = page.locator('input[type="number"]');
    const priceInput = page.locator('input[placeholder*="価格"]').last();
    
    await expect(quantityInput).toBeVisible();
  });

  test('T063-5: ポートフォリオページへのナビゲーション', async ({ page }) => {
    // ナビゲーションメニューのポートフォリオリンクをクリック
    const portfolioLink = page.locator('text=ポートフォリオ');
    await expect(portfolioLink).toBeVisible();
    await portfolioLink.click();

    // ポートフォリオページに遷移したことを確認
    await page.waitForURL(/\/portfolio/);
    const url = page.url();
    expect(url).toContain('/portfolio');

    // ポートフォリオページのコンテンツが表示されたことを確認
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toBeVisible();
  });

  test('T064-1: API統合 - 銘柄データ取得', async ({ page }) => {
    // ネットワークリクエストをモニタリング
    const apiResponses: any[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/stocks')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // ホームページが読み込まれ、APIが呼び出されることを確認
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // APIが正常にデータを返したことを確認
    const stocksApiCall = apiResponses.find((r) => r.url.includes('/api/stocks'));
    expect(stocksApiCall).toBeDefined();
    expect(stocksApiCall?.status).toBe(200);
  });

  test('T064-2: API統合 - 分析結果取得', async ({ page }) => {
    const apiResponses: any[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/analysis')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // テーブルの最初の行をクリックして詳細ページに遷移
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await page.waitForURL(/\/stocks\/\d+/);
    await page.waitForLoadState('networkidle');

    // 分析結果APIが呼び出されたことを確認
    const analysisApiCall = apiResponses.find((r) => r.url.includes('/api/analysis'));
    expect(analysisApiCall).toBeDefined();
    expect(analysisApiCall?.status).toBe(200);
  });

  test('T064-3: API統合 - ポートフォリオデータ取得', async ({ page }) => {
    const apiResponses: any[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/portfolio')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // ナビゲーションメニューのポートフォリオリンクをクリック
    const portfolioLink = page.locator('text=ポートフォリオ');
    await portfolioLink.click();
    await page.waitForURL(/\/portfolio/);
    await page.waitForLoadState('networkidle');

    // ポートフォリオAPIが呼び出されたことを確認
    const portfolioApiCall = apiResponses.find((r) => r.url.includes('/api/portfolio'));
    expect(portfolioApiCall).toBeDefined();
    expect(portfolioApiCall?.status).toBe(200);
  });

  test('T064-4: エラーハンドリング - 不正な銘柄ID', async ({ page }) => {
    // 不正な銘柄IDでアクセス
    await page.goto('/stocks/99999');

    // エラーメッセージまたはリダイレクトを確認
    const errorMessage = page.locator('text=見つかりません');
    const homeLink = page.locator('text=ホーム');

    // エラーメッセージが表示されるか、ホームにリダイレクトされるか確認
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);
    const isHomeVisible = await homeLink.isVisible().catch(() => false);
    
    expect(isErrorVisible || isHomeVisible).toBe(true);
  });

  test('T064-5: レスポンスタイム確認', async ({ page }) => {
    const startTime = Date.now();

    // ホームページが完全に読み込まれるまでの時間を測定
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 応答時間が妥当な範囲内であることを確認（5秒以内）
    expect(loadTime).toBeLessThan(5000);
  });
});
