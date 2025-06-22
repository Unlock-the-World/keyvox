# 🔓 KEYVOX API Sample Code - GAS / Node.js / Replit / Railway / Vercel 対応

**KEYVOX** は、QRコードベースのアクセス制御を軸に、スマートロック・スマートロッカーとSaaSを統合的に提供するプロジェクトです。  
このリポジトリは、KEYVOX APIを使った**マルチ環境での導入サンプル**を提供します。

👉 Google Apps Script (GAS)  
👉 Node.js (Replit, Railway, Vercel)  
👉 クライアント・サーバー問わず、柔軟な構成で導入可能です。

## 📋 Table of Contents
- [概要](#概要)
- [KEYVOXとは](#KEYVOXとは)
- [このリポジトリでできること](#このリポジトリでできること)
- [事前準備](#事前準備)
- [クイックスタート](#クイックスタート)
- [オフィシャルリソース](#オフィシャルリソース)
- [コントリビューション歓迎](#コントリビューション歓迎)
- [ライセンス](#ライセンス)

## 概要
KEYVOX は QRコードによるスマートロックアクセス制御を提供する強力なプラットフォームです。
このリポジトリは公式のサンプルコード集として、GAS・Node.js・Replit・Railway・Vercel に対応しています。
 本リポジトリは、開発者でありKEYVOX創業者である岡本氏による個人プロジェクトを起源とし、現在はUnlock-the-World　KEYVOXの公式リポジトリとして公開・保守されています。

---

## KEYVOXとは

> **「鍵は、自由へのパスポート」**  
私たちは、扉を開けるその瞬間を、ストレスなく感動的にすることにこだわっています。  
QRコードでスマートにアクセス。鍵のUXを極限まで高めたスマートロック、それがKEYVOXです。

▶ 詳細：https://keyvox.co

---

## このリポジトリでできること

| 環境 | 内容 |
|------|------|
| 🔵 GAS | Webhook受信 / API呼び出し / 解錠通知メール送信 |
| 🟢 Node.js | 任意のAPI操作スクリプト / Express対応Webhook処理 |
| 🟡 Replit / Vercel | サーバーレス構成での解錠制御 / UI連携も可能 |
| 🔴 Railway | Nodeベースの常駐Webhook/API操作環境に最適 |

---

## 事前準備

1. [KEYVOX無料アカウント登録](https://keyvox.co/free)
2. ロックの初期設定（[設定ガイド](https://keyvox.notion.site/2d2e09a81d274308b041f458f0992417)）
3. APIキーを取得（[API取得手順](https://keyvox.notion.site/API-44c489d8c97a4eba8a7fa0028c3b39a1)）

---

## クイックスタート

### 🧩 A. Google Apps Script（最も簡単）
- `storeKeys()` を1度実行し、APIキー・ロックIDなどを保存
- Webhook受信用のエンドポイントとして GAS を公開
- 通知や解錠コマンドを柔軟に制御可能
➡ GASプロジェクト作成後、`Code.gs` にスクリプトをコピーしてください

---

### 🔧 B. Replit / Railway / Vercel（Node.js）

1. `.env` ファイルを作成し、以下を定義します：（`.env.example` も提供しています）：

```env.
KEYVOX_API_KEY=your_api_key_here
KEYVOX_SECRET=your_secret_key_here
LOCK_ID=your_lock_id_here
```

2. `npm install` で依存をインストール  
3. `node index.js` または `vercel dev`, `railway run` で起動  
4. Webhook設定先にデプロイURLを指定すれば解錠制御が可能に

🔍 補足：.env.example をコピーして .env を作成する場合は以下のコマンドを実行してください
cp .env.example .env

### 📁 共通ライブラリ（ヘルパー）

- `helper-gas/code.js`：Google Apps Script（GAS）でのKEYVOX API呼び出し用
- `helper-node/keyvoxHelper.js`：Node.jsでのHMAC署名付きAPIアクセス用

アプリ側で読み込んで使用：
```
const helper = require('./keyvoxHelper');
await helper.unlockLock('your_lock_id');
```
---

## オフィシャルリソース

- 📚 ドキュメントポータル: https://developers.keyvox.co  
- 🧪 公式APIサンプル（GitLab）: https://gitlab.com/blockchainlock/api-demo  
- 💬 Discordコミュニティ: https://discord.gg/QBUBmjaSj8

---

## コントリビューション歓迎

- Issue提起 / PR歓迎します
- 本リポジトリの改善アイデアも大歓迎です
- 「世界をUnlockしたい」開発者の参加をお待ちしています

---

## ライセンス

MITライセンスで公開されています。詳細は `LICENSE.jp.md` を参照してください。

