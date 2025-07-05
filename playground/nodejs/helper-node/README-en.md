# 🔑 KEYVOX API Helper for Node.js

## Overview

This module is a helper library to easily interact with the KEYVOX API from a Node.js environment.
It automatically handles the complex HMAC-SHA256 signature authentication process, allowing developers to use API features with simple function calls.

## ✨ Key Features

* Automatically handles the complex HMAC-SHA256 signature authentication.
* Provides high-level functions for common operations like creating PINs and remote unlocking.
* Easily integrable into any Node.js project.

## ⚙️ 1. Setup

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or later is recommended)
* [node-fetch](https://www.npmjs.com/package/node-fetch) package (v2)

### 1. Install Dependencies

This helper uses `node-fetch`. Please install it using the following command.

```bash
npm install node-fetch@2
```
> **Note**: This code uses `require`, so please install version 2 of `node-fetch`.

### 2. Place the Helper File

Copy the `keyvoxHelper.js` file into your project, for example, into a `helpers/` directory.

### 3. Configure Environment Variables

An `API Key` and a `Secret Key` are required for authentication. To manage these securely, please set them as environment variables.

A common practice is to create a `.env` file in your project's root directory and add the keys provided by KEYVOX.

**Example `.env` file:**
```
KEYVOX_API_KEY="YOUR_API_KEY"
KEYVOX_SECRET="YOUR_SECRET_KEY"
```

To load this `.env` file, we recommend using the `dotenv` package.

```bash
npm install dotenv
```

Then, add the following line at the top of your application's entry point (e.g., `app.js`).
```javascript
require('dotenv').config();
```

## 🚀 2. Usage (API Reference)

First, import the `keyvoxHelper.js` module using `require`.

```javascript
const keyvox = require('./path/to/keyvoxHelper.js');

// Call the methods inside an async function
async function main() {
  try {
    // Execute helper functions here
  } catch (error) {
    console.error('API call failed:', error);
  }
}

main();
```
> **Note**: All functions are asynchronous (`async`) and return a `Promise`. Use `await` to get the result.

---

### `createLockPin(unitId, pin, sTime, eTime, targetName)`

Creates a PIN code for a smart lock.

**Parameters**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `unitId` | `string` | The Unit ID of the target lock. |
| `pin` | `string` | The PIN code you want to set. |
| `sTime` | `string` | The start time when the PIN becomes active (as a Unix timestamp string). |
| `eTime` | `string` | The end time when the PIN becomes inactive (as a Unix timestamp string). |
| `targetName` | `string` | A string for identification, such as the user's name. |

**Example**
```javascript
async function createNewPin() {
  const unitId = 'UNIT001';
  const newPin = '123456';
  const startTime = Math.floor(Date.now() / 1000).toString(); // Current time
  const endTime = (Math.floor(Date.now() / 1000) + 3600).toString(); // 1 hour later
  const userName = 'Test User';

  const responseText = await keyvox.createLockPin(unitId, newPin, startTime, endTime, userName);
  console.log('Create PIN Response:', JSON.parse(responseText));
}
```

---

### `unlockLock(lockId)`

Remotely unlocks a specified smart lock.

**Parameters**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `lockId` | `string` | The ID of the lock you want to unlock. |

**Example**
```javascript
async function unlockRemote() {
  const lockIdToUnlock = 'LOCK_XYZ';
  const responseText = await keyvox.unlockLock(lockIdToUnlock);
  console.log('Unlock Lock Response:', JSON.parse(responseText));
}
```

---

### `unlockLocker(deviceId, boxNum)`

Remotely unlocks a specified locker box (e.g., for parcels).

**Parameters**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `deviceId` | `string` | The device ID of the locker you want to unlock. |
| `boxNum` | `string` | The box number you want to unlock. |

**Example**
```javascript
async function openLocker() {
  const lockerId = 'LOCKER_ABC';
  const boxNumber = '3';

  const responseText = await keyvox.unlockLocker(lockerId, boxNumber);
  console.log('Unlock Locker Response:', JSON.parse(responseText));
}
```

---

### 🧰 Low-level API: `callApi(apiName, bodyObject)`

If you need to call an API endpoint not covered by the high-level functions, you can use this generic function.

**Example: (Assuming an API endpoint named `getLockList` exists)**
```javascript
async function getListOfLocks() {
  const params = { page: 1, limit: 10 };
  const responseText = await keyvox.callApi('getLockList', params);
  console.log('Lock List:', JSON.parse(responseText));
}
```

## 📄 License

MIT License