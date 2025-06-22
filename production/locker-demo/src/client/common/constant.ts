
export enum Path {
  Home = "/",
}


/**
 * request api
 */
export const ClientApi = {
  BASE_URL: process.env.NODE_ENV === 'production' ? '' : `http://localhost:${3000}`,
  PATH: '/api',
  LOGIN: '/account/login',
  LOCKERS:'/lockers',
  BOXES:'/boxes',
  LOCKERPIN:'/lockerPin',
  ORDER_LIST:'/orders/list',
  ORDER_CANCEL:'/orders/cancel',
  ORDER_DETAIL:'/orders/detail',
  AMOUNT:'/amount',
  ORDER_SAVE:'/orders/save',
}


/**
 * http method
 */
export const ApiMethod ={
  POST: "POST",
  GET : "GET",
}

/**
 * error message
 */
export const codeMessage = {
  '400': 'リクエストエラー',
  '401': '権限がないか、ユーザー情報が誤っています',
  '403': 'アクセスが許可されていません',
  '404': '存在しないデータに対してリクエストが行われました',
  '406': 'リクエストの形式が正しくありません',
  '410': '既に削除されたデータです。再度画面を表示しなおしてください。',
  '422': '不正な入力データがあります',
  '500': 'サーバーとの通信に失敗しました',
  '502': 'ネットワークハブとの通信エラー',
  '503': '現在サービスはメンテナンス中です、しばらく時間を空けてから再度ご利用ください',
  '504': 'ネットワークハブとの通信がタイムアウトしました',
}
