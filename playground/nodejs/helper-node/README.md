  # 🔑 KEYVOX API Helper for Node.js

## 概要

このモジュールは、KEYVOX APIをNode.js環境から簡単に利用するためのヘルパーです。
複雑なHMAC-SHA256署名認証プロセスを自動的に処理するため、開発者はAPIの各機能をシンプルな関数呼び出しで利用できます。

## ✨ 主な機能

* 複雑なHMAC-SHA256署名認証を自動的に処理
* PINコード作成、遠隔解錠など、一般的な操作のための高レベルな関数を提供
* 任意のNode.jsプロジェクトに容易に統合可能

## ⚙️ 1. セットアップ

### 前提条件

* [Node.js](https://nodejs.org/) (v14以降を推奨)
* [node-fetch](https://www.npmjs.com/package/node-fetch) パッケージ (v2)

### 1. 依存パッケージのインストール

このヘルパーは `node-fetch` を利用します。以下のコマンドでインストールしてください。

```bash
npm install node-fetch@2
```
> **注意**: このコードは `require` を使用しているため、`node-fetch` のバージョン2系をインストールしてください。

### 2. ヘルパーファイルの配置

この `keyvoxHelper.js` ファイルをあなたのプロジェクト内の任意の場所（例: `helpers/`ディレクトリ）にコピーします。

### 3. 環境変数の設定

APIの認証には `APIキー` と `シークレットキー` が必要です。これらを安全に管理するため、環境変数として設定してください。

プロジェクトのルートに `.env` ファイルを作成し、KEYVOXから提供されたキーを記述するのが一般的です。

**.env ファイルの例**
```
KEYVOX_API_KEY="YOUR_API_KEY"
KEYVOX_SECRET="YOUR_SECRET_KEY"
```

この `.env` ファイルを読み込むために、`dotenv` パッケージの利用を推奨します。

```bash
npm install dotenv
```

そして、アプリケーションのエントリーポイント（`app.js`など）の先頭で以下のように記述します。
```javascript
require('dotenv').config();
```

## 🚀 2. 使い方 (APIリファレンス)

まず、`keyvoxHelper.js` を `require` で読み込みます。

```javascript
const keyvox = require('./path/to/keyvoxHelper.js');

// 非同期関数内で各メソッドを呼び出します
async function main() {
  try {
    // ここでヘルパーの関数を実行
  } catch (error) {
    console.error('API call failed:', error);
  }
}

main();
```
> **注意**: すべての関数は非同期（`async`）であり、`Promise` を返します。`await` を使って結果を取得してください。

---

### `createLockPin(unitId, pin, sTime, eTime, targetName)`

スマートロックのPINコード（暗証番号）を作成します。

**パラメータ**
| 引数 | 型 | 説明 |
| :--- | :--- | :--- |
| `unitId` | `string` | 対象となるロックのユニットID。 |
| `pin` | `string` | 設定したいPINコード。 |
| `sTime` | `string` | PINコードが有効になる開始時刻（Unixタイムスタンプの文字列）。 |
| `eTime` | `string` | PINコードが無効になる終了時刻（Unixタイムスタンプの文字列）。 |
| `targetName` | `string` | カギを利用する利用者名。 |

**使用例**
```javascript
async function createNewPin() {
  const unitId = 'UNIT001';
  const newPin = '123456';
  const startTime = Math.floor(Date.now() / 1000).toString(); // 現在時刻
  const endTime = (Math.floor(Date.now() / 1000) + 3600).toString(); // 1時間後
  const userName = 'Test User';

  const responseText = await keyvox.createLockPin(unitId, newPin, startTime, endTime, userName);
  console.log('Create PIN Response:', JSON.parse(responseText));
}
```

---

### `unlockLock(lockId)`

指定したスマートロックを遠隔で解錠します。

**パラメータ**
| 引数 | 型 | 説明 |
| :--- | :--- | :--- |
| `lockId` | `string` | 解錠したいロックのID。 |

**使用例**
```javascript
async function unlockRemote() {
  const lockIdToUnlock = 'LOCK_XYZ';
  const responseText = await keyvox.unlockLock(lockIdToUnlock);
  console.log('Unlock Lock Response:', JSON.parse(responseText));
}
```

---

### `unlockLocker(deviceId, boxNum)`

指定した宅配ボックスなどを遠隔で解錠します。

**パラメータ**
| 引数 | 型 | 説明 |
| :--- | :--- | :--- |
| `deviceId` | `string` | 解錠したい宅配ボックスなどのデバイスID。 |
| `boxNum` | `string` | 解錠したいボックスの番号。 |

**使用例**
```javascript
async function openLocker() {
  const lockerId = 'LOCKER_ABC';
  const boxNumber = '3';

  const responseText = await keyvox.unlockLocker(lockerId, boxNumber);
  console.log('Unlock Locker Response:', JSON.parse(responseText));
}
```

---

### 🧰 低レベルAPI: `callApi(apiName, bodyObject)`

提供されている高レベル関数以外のAPIエンドポイントを呼び出したい場合、この汎用関数を使用できます。

**使用例: (`getLockList` というAPIがある場合)**
```javascript
async function getListOfLocks() {
  const params = { page: 1, limit: 10 };
  const responseText = await keyvox.callApi('getLockList', params);
  console.log('Lock List:', JSON.parse(responseText));
}
```