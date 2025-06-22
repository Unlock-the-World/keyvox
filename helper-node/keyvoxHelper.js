// helper-node/keyvoxHelper.js

const crypto = require('crypto');
const fetch = require('node-fetch');

const API_KEY = process.env.KEYVOX_API_KEY;
const SECRET_KEY = process.env.KEYVOX_SECRET;
const BASE_URL = 'https://eco.blockchainlock.io/api/eagle-pms/v1';

function getHeaders(apiName, payload) {
  const date = new Date().toUTCString();
  const digest = 'SHA-256=' + crypto.createHash('sha256').update(payload).digest('base64');
  const stringToSign = `date: ${date}\nPOST /api/eagle-pms/v1/${apiName} HTTP/1.1\ndigest: ${digest}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(stringToSign).digest('base64');

  return {
    'date': date,
    'authorization': `hmac username=\"${API_KEY}\", algorithm=\"hmac-sha256\", headers=\"date request-line digest\", signature=\"${signature}\"`,
    'x-target-host': 'default.pms',
    'digest': digest,
    'Content-Type': 'application/json'
  };
}

async function callApi(apiName, bodyObject) {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('API_KEY or SECRET_KEY is not set in environment variables');
  }

  const payload = JSON.stringify(bodyObject);
  const headers = getHeaders(apiName, payload);
  const url = `${BASE_URL}/${apiName}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: payload
  });

  const responseBody = await response.text();
  return responseBody;
}

// Example methods
async function createLockPin(unitId, pin, sTime, eTime, targetName) {
  const postParam = {
    unitId,
    pinCode: pin,
    sTime: sTime.toString(),
    eTime: eTime.toString(),
    targetName
  };
  return await callApi('createLockPin', postParam);
}

async function unlockLock(lockId) {
  const postParam = {
    lockId,
    flag: '1' // 1 = unlock
  };
  return await callApi('unlock', postParam);
}

async function unlockLocker(deviceId, boxNum) {
  const postParam = {
    deviceId,
    boxNum
  };
  return await callApi('unlockLocker', postParam);
}

module.exports = {
  callApi,
  createLockPin,
  unlockLock,
  unlockLocker
};
