import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';
import crypto from 'crypto';

//  API設定
const UNIT_ID = "YOUR_UNITID"; //KEYVOX管理画面上で、ロックが結びついたドアのunitidを取得してください
const API_NAME = "issueLockKey";
const API_HOST = "it-eco.blockchainlock.io";
const API_PATH = `/api/eagle-pms/v1/${API_NAME}`;

/**
 * KEYVOXのissueLockKey APIを呼び出す
 * @param {Object} payload - Wix Automationからの入力ペイロード
 */
export async function invoke(payload) {
  try {
    console.log("Payload received:", JSON.stringify(payload, null, 2));

    // データ抽出
    const data = payload.payload;
    const fullName = data.contact?.name?.last || "Guest";
    const emailAddress = data.contact?.email;
    const startRaw = data.start_date;
    const endRaw = data.end_date;

    const startDate = new Date(startRaw);
    const endDate = new Date(endRaw);
    const sTime = Math.floor(startDate.getTime() / 1000).toString();
    const eTime = Math.floor(endDate.getTime() / 1000).toString();

    // リクエストボディ作成
    const requestBody = {
      unitId: UNIT_ID,
      sTime,
      eTime,
      targetName: fullName,
      notificationMethod: "email",
      notificationDetails: {
        email: emailAddress
      }
    };

    const bodyString = JSON.stringify(requestBody);
    const dateHeader = new Date().toUTCString();
    const digest = 'SHA-256=' + crypto.createHash('sha256').update(bodyString).digest('base64');
    const requestLine = `POST ${API_PATH} HTTP/1.1`;
    const signingString = `date: ${dateHeader}\n${requestLine}\ndigest: ${digest}`;

    // シークレットキーの取得
    const apiKey = await getSecret("KEYVOX_API_KEY");
    const secretKey = await getSecret("KEYVOX_SECRET_KEY");

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(signingString)
      .digest('base64');

    const authorizationHeader = `hmac username="${apiKey}", algorithm="hmac-sha256", headers="date request-line digest", signature="${signature}"`;

    const headers = {
      'x-target-host': 'default.pms',
      'date': dateHeader,
      'digest': digest,
      'authorization': authorizationHeader,
      'Content-Type': 'application/json'
    };

    // リクエスト送信
    const response = await fetch(`https://${API_HOST}${API_PATH}`, {
      method: 'POST',
      headers,
      body: bodyString
    });

    const result = await response.json();
    console.log("KEYVOX Response:", JSON.stringify(result, null, 2));

    return {};
  } catch (error) {
    console.error("KEYVOX API Error:", error);
    throw error;
  }
}
