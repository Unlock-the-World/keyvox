# 🔑 KEYVOX API Helper for Google Apps Script

## 概要

このGoogle Apps Script (GAS) は、KEYVOX APIをGoogleのサービス（スプレッドシート、Gmail、カレンダーなど）から簡単に利用するためのヘルパースクリプトです。
複雑なHMAC-SHA256署名認証プロセスを自動的に処理するため、開発者はAPIの各機能をシンプルな関数呼び出しで利用できます。

## ✨ 主な機能

- 複雑なHMAC-SHA256署名認証を自動的に処理
- `PropertiesService` を利用し、コード内に直接キーを記述しない安全なAPIキー管理を実現
- PINコード作成、遠隔解錠など、一般的な操作のための高レベルな関数を提供
- トリガー（時間ベース、スプレッドシート編集時など）と組み合わせることで、様々な業務を自動化

## ⚙️ 1. セットアップ

### ステップ1: スクリプトの設置

1.  Google Apps Scriptのプロジェクトを新規作成、または既存のプロジェクトを開きます。
2.  提供されたコード (`.gs`ファイルの内容) を全てスクリプトエディタにコピー＆ペーストします。

### ステップ2: APIキーとシークレットキーの設定

APIの認証情報を安全に保管するため、スクリプトのプロパティ機能を利用します。

1.  スクリプトエディタで、`storeKeys` 関数内にある以下の2行を、あなたのAPIキーとシークレットキーに書き換えます。
    ```javascript
    scriptProperties.setProperty('API_KEY', 'ここに自分のAPIキーを貼り付ける');
    scriptProperties.setProperty('SECRET_KEY', 'ここに自分のAPIシークレットキー貼り付ける');
    ```
2.  スクリプトエディタの上部にある関数選択ドロップダウンから `storeKeys` を選択し、`▶ 実行` ボタンを押して一度だけ実行します。
3.  実行が完了すると、APIキーがスクリプトのプロパティに保存されます。
4.  **【重要】** セキュリティのため、`storeKeys` 関数に記述した実際のキーは削除し、元の `'ここに〜'` の状態に戻しておくことを強く推奨します。

### ステップ3: 定数の設定

スクリプトの上部にある定数（`UNIT_ID`, `LOCK_ID`, `DEVICE_ID`）を、操作したい対象に応じて設定してください。これらのIDは、KEYVOXの管理画面や、別途API（例: `getUnit`）で取得できます。

```javascript
// 必要な定数の宣言
const UNIT_ID = "your_unit_id_value"; //ドアのIDをgetUnitAPIで取得
const LOCK_ID = "your_lock_id_value"; //ロックのIDをgetUnitAPIで取得
const DEVICE_ID = "your_device_id_value"; //ロッカーのIDをgetUnitAPIで取得
```

## 🚀 2. 使い方 (APIリファレンス)

セットアップが完了したら、各サンプル関数をそのまま利用したり、独自の関数から呼び出したりすることができます。関数の実行結果は `Logger.log()` を使って確認できます。（`表示`メニュー > `ログ`）

---

### `createLockPinFromGmail(pin, stime, etime, targetName)`

スマートロックのPINコード（暗証番号）を作成します。

**パラメータ**
| 引数 | 型 | 説明 |
| :--- | :--- | :--- |
| `pin` | `string` | 設定したいPINコード。 |
| `stime` | `string` | PINコードが有効になる開始時刻（Unixタイムスタンプの文字列）。 |
| `etime` | `string` | PINコードが無効になる終了時刻（Unixタイムスタンプの文字列）。 |
| `targetName` | `string` | カギを利用する利用者名。 |

**使用例**
Gmailの受信をトリガーにして、新しいPINコードを作成するなどの応用が可能です。

```javascript
function createNewPinSample() {
  const unitId = UNIT_ID; // 事前に設定した定数を利用
  const newPin = '123456';
  const startTime = Math.floor(Date.now() / 1000).toString(); // 現在時刻
  const endTime = (Math.floor(Date.now() / 1000) + 3600).toString(); // 1時間後
  const userName = 'Test User';

  const response = createLockPinFromGmail(newPin, startTime, endTime, userName);
  Logger.log(response.getContentText()); // APIからのレスポンスをログに出力
}
```

---

### `unlockLock()`

指定したスマートロックを遠隔で解錠します。（事前に定数 `LOCK_ID` の設定が必要です）

**使用例**
```javascript
function unlockSample() {
  const response = unlockLock();
  Logger.log(response.getContentText());
}
```

---

### `unlockLocker(boxNum)`

指定した宅配ボックスなどを遠隔で解錠します。（事前に定数 `DEVICE_ID` の設定が必要です）

**パラメータ**
| 引数 | 型 | 説明 |
| :--- | :--- | :--- |
| `boxNum` | `string` or `number` | 解錠したいボックスの番号。 |

**使用例**
この関数はAPIのレスポンスを判定し、成功・失敗に応じた日本語のメッセージを返します。
```javascript
function openLockerSample() {
  const boxNumber = '3';
  const message = unlockLocker(boxNumber);
  Logger.log(message); // "解錠しました。..." or "ロッカーの解錠に失敗しました。..."
}
```

---

### 🧰 低レベルAPI: `callApi(apiName, postParam)`

提供されているサンプル以外のAPIエンドポイントを呼び出したい場合、この汎用関数を使用できます。KEYVOX APIの仕様書を確認し、`apiName`と`postParam`を適切に設定してください。

**パラメータ**
| 引数 | 型 | 説明 |
| :--- | :--- | :--- |
| `apiName` | `string` | 呼び出したいAPIのエンドポイント名（例: `createLockPin`）。 |
| `postParam` | `string` | APIに送信するリクエストボディ。`JSON.stringify()` で文字列化する必要があります。 |


**使用例: (`getLockList` というAPIがある場合)**
```javascript
function getListOfLocks() {
  // 注意: このAPIエンドポイントは架空のものです。
  // 実際のAPI仕様に合わせて apiName と postParam を設定してください。
  const apiNameToCall = 'getLockList';
  const params = {
    page: 1,
    limit: 10
  };

  const response = callApi(apiNameToCall, JSON.stringify(params));
  if (response) {
    Logger.log(response.getContentText());
  }
}
```