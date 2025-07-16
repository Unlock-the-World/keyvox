# 🔐 KEYVOX issueLockKey Automation (Wix Velo Integration)

このリポジトリは、**Wix Velo** で動作するバックエンドスクリプトです。予約データを受け取り、[KEYVOX API](https://developers.keyvox.co/) の `issueLockKey` を実行して、指定期間に対応するスマートロックのPINやQRを発行します。

## 🧩 主な機能

- Wix Bookingアプリで作成したサービスに予約が入るのをトリガーとし、その予約情報をペイロードで取得する
- 顧客情報と予約時間からスマートロック発行リクエストを自動送信
- HMAC-SHA256による署名生成と認証
- KEYVOXのPIN/QRの自動メール送信にも対応（通知設定済みのユニット）

## 📁 ファイル構成
```
.
├── booking    // メインの発行処理ロジック   
├── README.md             // このファイル  
```

## 🚀 使用方法

### 1. Wix Secrets Manager に以下のキーを登録

| キー名                 | 用途                        |
|------------------------|-----------------------------|
| `KEYVOX_API_KEY`       | 発行済みのAPIキー           |
| `KEYVOX_SECRET_KEY`    | 対応するシークレットキー    |

> 💡 `getSecret()` で各値を取得しています。直接コードにハードコーディングしないでください。
> 
> 💡 unitidは直接コードに挿入する設計になっています。KEYVOX管理画面でロックが結びついた当該ドアのunitidを取得し、入力してください。

### 2. invoke関数を Wix オートメーションまたは HTTP Functions から呼び出し

```javascript
import { invoke } from 'backend/keyvox.jsw';

export function myFunction(payload) {
  return invoke(payload);
}
```

### 3. ペイロード形式

以下のようなペイロード形式を想定しています（一部省略）：

```json
{
  "payload": {
    "start_date": "2025-08-01T10:00:00+09:00",
    "end_date": "2025-08-01T11:00:00+09:00",
    "contact": {
      "name": { "last": "山田" },
      "email": "yamada@example.com"
    }
  }
}
```

## 🔐 署名仕様

KEYVOX API の仕様に従って、以下をHMAC-SHA256で署名しています：

```
date: <リクエスト日時>
POST /api/eagle-pms/v1/issueLockKey HTTP/1.1
digest: SHA-256=<Base64Digest>
```
Authorizationヘッダー形式：
```
hmac username="<API_KEY>", algorithm="hmac-sha256", headers="date request-line digest", signature="<signature>"
```

## ✅ KEYVOX APIリクエスト構造
送信先：
```
POST https://it-eco.blockchainlock.io/api/eagle-pms/v1/issueLockKey
```
ボディ例：
```json
{
  "unitId": "6865f141ee911e306bca7da7",
  "sTime": "1723489200",
  "eTime": "1723492800",
  "targetName": "山田",
  "notificationMethod": "email",
  "notificationDetails": {
    "email": "yamada@example.com"
  }
}
```
