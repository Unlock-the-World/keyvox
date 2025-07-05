// データを記録するスプレッドシートのIDを設定
const SPREADSHEET_ID = '';
// データを記録するシート名を設定
const SHEET_NAME = '';

/**
 * Webhook (POSTリクエスト) を受信したときに実行されるメイン関数
 * JSONの全キーの値を抽出し、スプレッドシートに記録します。
 */
function doPost(e) {
  try {
    // スプレッドシートをシートを取得
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('指定されたシートが見つかりません: ' + SHEET_NAME);
    }

    // POSTリクエストの本体を取得し"data"プロパティの値を取得
    const payload = e.postData.contents;
    const json = JSON.parse(payload);
    const data = json.data;
    if (!data) {
      throw new Error('JSONに"data"オブジェクトが見つかりません。');
    }

    // データの抽出
    const event = json.event || '';
    const eventTime = json.eventTime || '';
    const orgId = data.orgId || '';
    const placeId = data.placeId || '';
    const unitId = data.unitId || '';
    const planId = data.planId || '';
    const reservationCode = data.reservationCode || '';
    const orderContact = data.orderContact || '';
    const unitName = data.unitName || '';
    const checkinTime = data.checkinTime || '';
    const checkoutTime = data.checkoutTime || '';
    const locationName = data.locationName || '';
    const locationAddress = data.locationAddress || '';
    const otaType = data.otaType || '';

    let deviceId = '';
    let deviceName = '';
    let pinCode = '';
    let qrCodeUrl = '';
    if (data.accessInfo && Array.isArray(data.accessInfo) && data.accessInfo.length > 0) {
      const firstAccessInfo = data.accessInfo[0];
      deviceId = firstAccessInfo.deviceId || '';
      deviceName = firstAccessInfo.deviceName || '';
      pinCode = firstAccessInfo.pinCode || '';
      qrCodeUrl = firstAccessInfo.qrCodeUrl || '';
    }
    
    // スプレッドシートへの書き込み
    const newRow = [
      new Date(), event, eventTime, orgId, placeId, unitId, planId,
      reservationCode, orderContact, unitName, checkinTime, checkoutTime,
      deviceId, deviceName, pinCode, qrCodeUrl, locationName,
      locationAddress, otaType
    ];
    sheet.appendRow(newRow);

    // すべての処理が完了したら、最後に成功レスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data logged successfully.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // どの段階でエラーが起きても、ここで一括して捕捉
    const errorMessage = error.toString();
    const rawData = e && e.postData ? e.postData.contents : 'N/A';
    console.error('Script Error: ' + errorMessage + ' RawData: ' + rawData);

    // エラー内容をスプレッドシートに記録
    try {
      const errorSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
      if (errorSheet) {
        errorSheet.appendRow([new Date(), 'SCRIPT_ERROR', errorMessage, rawData]);
      }
    } catch (logError) {
      console.error('Failed to log error to spreadsheet: ' + logError.toString());
    }

    // 処理が失敗したことを示すレスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: errorMessage }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GETリクエストを受信したときに実行される関数。
 */
function doGet(e) {
  const TARGET_COLUMN_INDEX = 2; // B列を判定

  // 最終行B列のデータをJSONのstatusキーに設定しこれをレスポンスとして返す
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('シートが見つかりません: ' + SHEET_NAME);
    const lastRow = sheet.getLastRow();
    let lastData = (lastRow > 1) ? sheet.getRange(lastRow, TARGET_COLUMN_INDEX).getValue().toString() : "NO_DATA";
    let response = { "status": lastData};

    // エラー発生時はエラー情報を返す
    return ContentService.createTextOutput(JSON.stringify(response, null, 2)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}