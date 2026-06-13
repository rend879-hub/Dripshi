/**
 * DRIPSHI — Vercel Serverless Function
 * /api/rakuten-search
 *
 * 楽天APIへのリクエストをサーバー側で代理。
 * Application ID は環境変数 RAKUTEN_APPLICATION_ID で管理し、
 * フロントエンドには一切露出しない。
 *
 * GET /api/rakuten-search?keyword=ニットベージュ&budget=15000
 */

export default async function handler(req, res) {
  // ── CORS ヘッダー（同一ドメインのみ許可する場合は不要だが保険として）──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 環境変数からAPIキーを取得（フロントには渡さない）──
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  if (!applicationId) {
    console.error('[DRIPSHI] RAKUTEN_APPLICATION_ID が未設定です');
    return res.status(500).json({ error: 'API key not configured', Items: [] });
  }

  // ── クエリパラメータを受け取る ──
  const { keyword, budget } = req.query;

  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: 'keyword is required', Items: [] });
  }

  // ── 楽天APIリクエスト組み立て ──
  const params = new URLSearchParams({
    applicationId,
    accessKey:    applicationId,
    keyword:  keyword.trim(),
    hits:     '10',
    format:   'json',
    sort:     '+itemPrice',
  });

  // 予算上限がある場合は maxPrice を指定
  if (budget && !isNaN(Number(budget))) {
    params.set('maxPrice', String(Number(budget)));
  }

  // 最新エンドポイント
  const rakutenUrl =
    'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?' +
    params.toString();

  try {
    const rakutenRes = await fetch(rakutenUrl, {
      headers: {
        'User-Agent': 'DRIPSHI/1.0',
        'Referer':    'https://dripshi.vercel.app',
        'Origin':     'https://dripshi.vercel.app',
      },
    });

    if (!rakutenRes.ok) {
      const errText = await rakutenRes.text();
      console.error('[DRIPSHI] Rakuten API error:', rakutenRes.status, errText);
      return res.status(502).json({
        error: 'Rakuten API error',
        status: rakutenRes.status,
        detail: errText,
        Items: []
      });
    }

    const data = await rakutenRes.json();

    // 楽天のレスポンスをそのままフロントへ転送
    return res.status(200).json(data);

  } catch (err) {
    console.error('[DRIPSHI] fetch error:', err);
    return res.status(502).json({ error: 'Network error', Items: [] });
  }
}
