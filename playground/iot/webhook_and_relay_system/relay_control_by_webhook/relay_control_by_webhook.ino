#include <M5Unified.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const int relayPin = 25; // リレー制御用のピン
const int getInterval = 10000; // GETリクエストの間隔

// Wi-FiのSSID, パスワード, GASのURLを設定
const char* ssid = "";
const char* password = "";
String url = "";

// GASにGETリクエストを送るとリダイレクトされるのでそれに対応するための関数
String httpGetWithRedirect(String url, int maxRedirects = 5) {
  HTTPClient http;
  int redirects = 0;

  while (redirects < maxRedirects) {
    Serial.println("Requesting: " + url);
    http.begin(url);  // URL全体で初期化
    int httpCode = http.GET();

    if (httpCode > 0) {
      Serial.printf("HTTP code: %d\n", httpCode);

      // リダイレクト系のステータスコード（301, 302, 303, 307, 308）
      if (httpCode >= 300 && httpCode < 400) {
        String newUrl = http.getLocation();
        Serial.println("Redirecting to: " + newUrl);
        url = newUrl;
        http.end();
        redirects++;
        continue;
      }

      // リダイレクト以外 → 結果を返す
      String payload = http.getString();
      http.end();
      return payload;
    } else {
      Serial.printf("HTTP request failed: %s\n", http.errorToString(httpCode).c_str());
      http.end();
      return "";
    }
  }

  Serial.println("Too many redirects");
  return "";
}

void setup() {
  // M5AtomLiteの初期設定
  auto cfg = M5.config();
  M5.begin(cfg);

  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);

  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("Connecting to WiFi...");

  // Wi-Fiに接続
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // 接続成功
  Serial.println("\nWiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // loop開始前に少し待機
  Serial.println("Starting requests in 3 seconds...");
  delay(3000);
}

void loop() {
  // JSONレスポンスを取得し、シリアル出力
  String response = httpGetWithRedirect(url);
  Serial.println("Response:");
  Serial.println(response);

  // JSONを格納するためのメモリ領域を確保（必要に応じて増やす）
  StaticJsonDocument<128> doc;
  // JSON解析
  DeserializationError error = deserializeJson(doc, response);
  // 解析失敗時はエラーを出力して処理を中断
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  // JSONからstatusキーの値を取得しシリアル出力
  const char* statusValue = doc["status"];
  Serial.print("status value: ");
  Serial.println(statusValue);
  // チェックアウト済みの場合リレーをOFF
  if (strcmp(statusValue, "booking.checked_out") == 0) {
    Serial.println("<<<checked_out>>>");
    digitalWrite(relayPin, LOW);
    delay(getInterval);
  // チェックイン済みの場合リレーをON
  } else if (strcmp(statusValue, "booking.checked_in") == 0){
    Serial.println("<<<checked_in>>>");
    digitalWrite(relayPin, HIGH);
    delay(getInterval);
  }
}