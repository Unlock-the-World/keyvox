import {useTranslation} from 'react-i18next';


//随机生成6位密码
export function generateRandomPwd() {
  const min = 100000;
  const max = 999999;
  const randomPassword = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomPassword.toString();
}

