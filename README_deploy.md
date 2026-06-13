# DRIPSHI — Vercel デプロイ手順

## ファイル構成

```
/
├── index.html                  ← dripshi_vercel.html をリネーム
├── api/
│   └── rakuten-search.js       ← Serverless Function（楽天APIプロキシ）
└── vercel.json                 ← ルーティング設定
```

## Step 1: ファイル配置

1. `dripshi_vercel.html` → `index.html` にリネームしてプロジェクトルートへ
2. `api/rakuten-search.js` をそのまま配置
3. `vercel.json` をそのまま配置

## Step 2: Vercel に環境変数を設定

Vercel ダッシュボード → プロジェクト → **Settings** → **Environment Variables**

| 変数名                     | 値                         | 環境             |
|----------------------------|----------------------------|------------------|
| `RAKUTEN_APPLICATION_ID`   | あなたの楽天 Application ID | Production / All |

## Step 3: デプロイ

```bash
vercel deploy --prod
```

または GitHub リポジトリと連携している場合は push するだけで自動デプロイ。

## Step 4: 動作確認

ブラウザで以下にアクセスして JSON が返れば成功：

```
https://あなたのドメイン.vercel.app/api/rakuten-search?keyword=ニットベージュ
```

レスポンス例：
```json
{
  "Items": [
    { "Item": { "itemName": "...", "itemPrice": 3990, ... } }
  ]
}
```

## セキュリティについて

- `RAKUTEN_APPLICATION_ID` はサーバー側のみで使用され、ブラウザには一切送信されません
- フロントエンド（HTML）には API キーが含まれていません
- Vercel の環境変数は暗号化されて保存されます
