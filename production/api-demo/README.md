# 🔐 KEYVOX API Demo

これは、**KEYVOX API** のサンプルソースです。
APIが要求するHMAC-SHA256方式の認証署名を生成し、実際に各種APIエンドポイント（ユニット情報の取得、暗証番号の作成・変更など）を呼び出す方法を示します。
Java、 PHP、JS(Postman用)を提供しています。

***APIドキュメント***
https://developers.keyvox.co

***KEVOX Locker API Key取得方法：***
https://keyvox.notion.site/API-44c489d8c97a4eba8a7fa0028c3b39a1?source=copy_link

## 目次
- [Java](#java)
- [PHP](#php)
- [JS(Postman)](#jspostman)
- [Python](#python)

## Java

### 含まれるファイル

- **HMAC認証ユーティリティ (`HttpUtils.java`)**:
  - `date`, `request-line`, `digest`を元にしたHMAC-SHA256署名を生成します。
  - `Authorization`ヘッダーを自動で組み立て、HTTP POSTリクエストを送信します。
- **APIテスト実行クラス (`TestFunction.java`)**:
  - 各API機能に対応したテストメソッドを提供します。
  - `main`メソッドを実行するだけで、定義された全てのテストを一括で実行できます。
- **Mavenによる簡単なセットアップ**:
  - `pom.xml`に必要なライブラリが定義されており、依存関係の解決を自動で行います。

### セットアップ手順

1.  **API認証情報の設定**
    `src/main/java/main/java/api/utils/TestFunction.java` ファイルを開き、あなた自身のAPIキーとシークレットに書き換えます。

    ```java
    // TestFunction.java
    
    public class TestFunction{
        // ...（途中省略）...
        
        // お客様用APIキー
        private static final String apikey = "ここにあなたのAPIキーを入力してください";
        private static final String secret = "ここにあなたのシークレットを入力してください";
        
        // ...（以下省略）...
    }
    ```

3.  **プロジェクトのビルド**
    プロジェクトのルートディレクトリで以下のコマンドを実行します。
    Mavenが必要なライブラリ（依存関係）を自動的にダウンロードし、プロジェクトをコンパイルします。

    ```sh
    mvn compile
    ```
    コンソールに `BUILD SUCCESS` と表示されればセットアップは完了です。

### 実行方法

#### 全てのテストを実行する

以下のコマンドを実行すると、`TestFunction.java`内に`test`で始まる名前で定義された全てのメソッドが順番に実行されます。

```sh
mvn exec:java
```

実行後、コンソールに各APIリクエストの内容と、サーバーからのレスポンスが出力されます。

#### 特定のテストのみを実行する

特定のAPI呼び出しだけを試したい場合は、`TestFunction.java`の`main`メソッドを直接編集します。

```java
// TestFunction.java の main メソッドを書き換える例

public static void main(String[] args) {
    // 元の一括実行コードをコメントアウトし、
    // 実行したいテストメソッドを直接呼び出します。
    
    // 例: 暗証番号の作成だけをテストする
    testCreateLockPin();
    
    // 例: ユニット一覧の取得だけをテストする
    // testGetUnitsin(); 
}
```
編集後、再度 `mvn exec:java` コマンドで実行してください。

## PHP

### セットアップ手順

1.  **依存ライブラリのインストール**
    ターミナルで`php_test.php`を保存したディレクトリに移動し、以下のコマンドを実行して`Requests for PHP`ライブラリをインストールします。

    ```sh
    composer require rmccue/requests
    ```
    これにより、`vendor`ディレクトリ、`composer.json`、`composer.lock`ファイルが生成されます。

3.  **スクリプトの修正**
    `api_test.php`の**一番上**に、Composerのオートローダーを読み込むための行を追加します。

    ```php
    require 'vendor/autoload.php'; // この行を追加
    ```

4.  **API認証情報の設定**
    `api_test.php`内の`$api_key`と`$secret_key`の値を、自分のものに書き換えます。

### 実行方法

全てのセットアップが完了したら、ターミナルから以下のコマンドでスクリプトを実行します。

```sh
php api_test.php
```

実行後、コンソールにAPIサーバーからのレスポンス内容が整形されて出力されます。

```
<pre>Requests_Response Object
(
    [body] => {"code":"0","msg":"success","data":[...]}
    [raw] => ...
    [headers] => ...
    [status_code] => 200
    ...
)
</pre>
```

### 他のAPIを試すには

`/getUnits`以外のAPI（例: `/createLockPin`）を試すには、`test_api.php`の以下の箇所を修正します。

1.  **APIパスの変更**: `$api_path`変数を、呼び出したいAPIのエンドポイント名に変更します。
2.  **リクエストボディの変更**: `$jdata`変数に、APIが必要とするパラメータをJSON形式で設定します。

## JS(Postman)

### 利用手順

1.  スクリプト内の各リクエストのapiKeyとsecretを自分のものに書き換えてください
2.  `postParam`変数に、APIが必要とするパラメータをJSON形式の文字列で設定します。
3.  Postmanアプリを起動し、左上の「Import」ボタンから提供されたJSONファイルをインポートします。`BCL20230207`という名前のコレクションがサイドバーに追加されます。
4.  テストしたいリクエストを選び、「**Send**」ボタンをクリックします。認証処理はバックグラウンドで自動的に実行されます。

#### 実行結果の例

実行に成功すると、画面下部のレスポンスパネルにAPIサーバーからの結果が表示されます。
```json
{
    "code": "0",
    "msg": "success",
    "data": [
        // ...
    ]
}
```

## Python

### 利用手順

1.  スクリプト内のapiKeyとsecretを自分のものに書き換えてください
2.  KeyvoxApiClientクラスにいくつかのAPIメソッドが用意されています。必要に応じて新しいAPIメソッドを追記してください
3.  メインブロック(if __name__ == "__main__":)で適切なインプットパラメータを指定して任意のAPIメソッドを実行してください
4.  実行に成功すると、APIサーバーからの結果が出力されます。

## 📄 ライセンス / License

MIT License