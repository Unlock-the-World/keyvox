# M5StackによるWebhook連動リレー制御

## Table of contents
- [概要](#概要)
- [このリポジトリでできること](#このリポジトリでできること)
- [クイックスタート](#クイックスタート)

---

## 概要
KEYVOXクラウドから送信される予約情報Webhook通知（チェックイン、チェックアウト）をトリガーとして、室内の電源をM5Stackで自動制御します。Google App Script (GAS)とArduinoスケッチで構成されます。

動作デモ動画
[https://youtube.com/shorts/HPcVL9-vbYA/0.jpg](https://youtube.com/shorts/HPcVL9-vbYA?feature=share)

---

## このリポジトリでできること

| 環境 | 内容 |
|------|------|
| 🔵 GAS | Webhookの受信と記録 / M5Stackに部屋の状態を送信 |
| 🟢 M5Stack | 部屋の状態を受信 / リレーの制御 |

---

## クイックスタート

1. GoogleスプレッドシートにGASを紐づけ、IDやシート名を追記
2. GASをウェブアプリとして公開
3. KEYVOXのWebhookを設定（[参考](https://keyvox.notion.site/Webhook-JSON-20969d1dc06e808b8c66ca9f38e61115)）
4. ArduinoスケッチにWi-fiのSSIDとパスワード、GASウェブアプリのURLを追記してM5Stackに書き込み