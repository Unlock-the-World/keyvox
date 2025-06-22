
export enum Path {
  Home = "/",
  List = "/list",
}

export enum StoreKey {
  Locker = "locker-control",
}


/**
 * request api
 */
export enum Api {
  API_BASE_URL= "https://eco.blockchainlock.io",
  API_PATH = "/api/eagle-pms/v1",
  API_KEY = process.env.API_KEY,
  API_SECRET = process.env.API_SECRET,
  API_VERIFY= `/account/user/vcodeByPhone`,

  API_GET_UNITS="getUnits",

  API_GET_LOCKERS="getLockers",

  API_GET_AVAILABLE_BOXES = "getAvailableBoxes",

  API_CREATE_LOCKER_PIN ="createLockerPin",

  API_GET_LOCKER_STATUS ="getLockerStatus"

}


/**
 * http method
 */
export enum ApiMethod {
  POST= "POST",
  GET = "GET",
}

/**
 * error message
 */
export enum CodeMessage {
  'ERROR_400'= 'リクエストエラー',
  'ERROR_401'= '権限がないか、ユーザー情報が誤っています',
  'ERROR_403'= 'アクセスが許可されていません',
  'ERROR_404'= '存在しないデータに対してリクエストが行われました',
  'ERROR_406'= 'リクエストの形式が正しくありません',
  'ERROR_410'= '既に削除されたデータです。再度画面を表示しなおしてください。',
  'ERROR_422'= '不正な入力データがあります',
  'ERROR_500'= 'サーバーとの通信に失敗しました',
  'ERROR_502'= 'ネットワークハブとの通信エラー',
  'ERROR_503'= '現在サービスはメンテナンス中です、しばらく時間を空けてから再度ご利用ください',
  'ERROR_504'= 'ネットワークハブとの通信がタイムアウトしました',
}


/**
 * Response status
 */
export enum ResStatus {
  SUCCESS = 200,
}

/**
 * api code
 */
export enum ResCode {
  'SUCCESS'= '0',
  'ERROR_0'= 'E0000',
  'ERROR_1'= 'E0001'
}


/**
 * Response status
 */
export enum ResErrorMsg {
  PARAMS = "参数错误",
}

export enum Order {
  STATUS_NORMAL= '0',
  STATUS_DELETE= '1',
  STATUS_CANCEL= '2'
}


