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
├── booking.js    // メインの発行処理ロジック   
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

### 2. invoke関数を Wix オートメーションから呼び出し

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
    "pricing_plan": "string",
    "staff_member_name_main_language": "string",
    "remaining_amount_due": {
        "value": "string",
        "currency": "string"
    },
    "booking_creation_date": "string",
    "staff_member_name": "string",
    "online_conference_enabled": "boolean",
    "order_id": "string",
    "business_name": "string",
    "booking_contact_phone": "string",
    "start_time_timestamp_with_timezone": "string",
    "start_date": "string",
    "location": "string",
    "booked_entity_id": "string",
    "order_number": "string",
    "bookings_page_url": "string",
    "notify_participants_by_sms": "boolean",
    "metasite_id": "string",
    "custom_policy_description": "string",
    "service_image_url": "string",
    "price": {
        "value": "string",
        "currency": "string"
    },
    "custom_price": "string",
    "add_on_groups": [
        {
            "addon_group_name": "string",
            "addon_group_details": "string"
        }
    ],
    "initiator_type": "string",
    "service_url": "string",
    "notify_participants": "boolean",
    "staff_member_message": "string",
    "owner_action_url": "string",
    "approval_service": "boolean",
    "service_name": "string",
    "business_time_zone": "string",
    "location_main_language": "string",
    "start_time_timestamp": "string",
    "location_id": "string",
    "booking_id": "string",
    "start_date_by_business_tz": "string",
    "custom_form_fields": [
        {
            "label": "string",
            "value": "string"
        }
    ],
    "staff_member_email": "string",
    "end_date": "string",
    "booking_contact_last_name": "string",
    "service_name_main_language": "string",
    "service_type": "string",
    "currency": "string",
    "number_of_participants": "number",
    "contact_id": "string",
    "service_id": "string",
    "business_phone": "string",
    "online_conference_url": "string",
    "ics": {
        "fileName": "string",
        "downloadUrl": "string"
    },
    "online_conference_password": "string",
    "business_email": "string",
    "instance_id": "string",
    "online_conference_description": "string",
    "booking_contact_first_name": "string",
    "ff48a1d6-418d-4c28-8415-68b5370962e9": "string",
    "c8fcd877-ec77-4e13-adb6-7c06da936537": "string",
    "contact": {
        "name": {
            "last": "string",
            "first": "string"
        },
        "email": "string",
        "locale": "string",
        "company": "string",
        "birthdate": "string",
        "labelKeys": {
            "items": [
                "string"
            ]
        },
        "contactId": "string",
        "address": {
            "city": "string",
            "addressLine": "string",
            "formattedAddress": "string",
            "country": "string",
            "postalCode": "string",
            "addressLine2": "string",
            "subdivision": "string"
        },
        "jobTitle": "string",
        "imageUrl": "string",
        "updatedDate": "string",
        "phone": "string",
        "createdDate": "string"
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
POST https://eco.blockchainlock.io/api/eagle-pms/v1/issueLockKey
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
