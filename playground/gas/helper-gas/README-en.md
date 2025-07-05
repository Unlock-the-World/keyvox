# 🔑 KEYVOX API Helper for Google Apps Script

## Overview

This Google Apps Script (GAS) is a helper script designed to simplify interaction with the KEYVOX API from Google services like Sheets, Gmail, and Calendar. It automatically handles the complex HMAC-SHA256 signature authentication process, allowing developers to use API features with simple function calls.

## ✨ Features

-   Automatically handles complex HMAC-SHA256 signature authentication.
-   Utilizes `PropertiesService` for secure API key management, avoiding the need to hardcode keys in the script.
-   Provides high-level functions for common operations such as creating PIN codes and remote unlocking.
-   Enables automation of various tasks by combining it with triggers (e.g., time-driven, on-spreadsheet-edit).

## ⚙️ 1. Setup

### Step 1: Install the Script

1.  Create a new Google Apps Script project or open an existing one.
2.  Copy and paste the entire provided code (the contents of the `.gs` file) into the script editor.

### Step 2: Configure API Key and Secret

To securely store your API credentials, this script uses Script Properties.

1.  In the script editor, find the `storeKeys` function and replace the placeholders with your actual API key and secret.
    ```javascript
    scriptProperties.setProperty('API_KEY', 'YOUR_API_KEY_HERE');
    scriptProperties.setProperty('SECRET_KEY', 'YOUR_SECRET_KEY_HERE');
    ```
2.  From the function dropdown menu at the top of the script editor, select `storeKeys` and click the **▶ Run** button once.
3.  Once executed, your API keys will be stored in the script's properties.
4.  **[IMPORTANT]** For security, it is strongly recommended to remove the actual keys from the `storeKeys` function after running it, reverting it to its original placeholder state.

### Step 3: Set Constants

At the top of the script, configure the constants (`UNIT_ID`, `LOCK_ID`, `DEVICE_ID`) according to the target you wish to operate. These IDs can be obtained from the KEYVOX management console or through other API calls (e.g., `getUnit`).

```javascript
// Declare necessary constants
const UNIT_ID = "your_unit_id_value"; // Get from getUnit API
const LOCK_ID = "your_lock_id_value"; // Get from getUnit API
const DEVICE_ID = "your_device_id_value"; // Get from getUnit API
```

## 🚀 2. Usage (API Reference)

Once set up, you can use the sample functions directly or call them from your own custom functions. You can check the execution results using `Logger.log()` (found under the `View` > `Logs` menu).

---

### `createLockPinFromGmail(pin, stime, etime, targetName)`

Creates a PIN code for a smart lock.

**Parameters**
| Argument | Type | Description |
| :--- | :--- | :--- |
| `pin` | `string` | The desired PIN code to set. |
| `stime` | `string` | The start time when the PIN becomes valid (as a Unix timestamp string). |
| `etime` | `string` | The end time when the PIN becomes invalid (as a Unix timestamp string). |
| `targetName` | `string` | The name of the user who will use the key. |

**Example Usage**
You can adapt this to create a new PIN triggered by an incoming Gmail message, for instance.

```javascript
function createNewPinSample() {
  const unitId = UNIT_ID; // Use the pre-configured constant
  const newPin = '123456';
  const startTime = Math.floor(Date.now() / 1000).toString(); // Current time
  const endTime = (Math.floor(Date.now() / 1000) + 3600).toString(); // 1 hour from now
  const userName = 'Test User';

  const response = createLockPinFromGmail(newPin, startTime, endTime, userName);
  Logger.log(response.getContentText()); // Log the API response
}
```

---

### `unlockLock()`

Remotely unlocks the specified smart lock. (Requires the `LOCK_ID` constant to be set beforehand).

**Example Usage**
```javascript
function unlockSample() {
  const response = unlockLock();
  Logger.log(response.getContentText());
}
```

---

### `unlockLocker(boxNum)`

Remotely unlocks a specific box of a delivery locker or similar device. (Requires the `DEVICE_ID` constant to be set beforehand).

**Parameters**
| Argument | Type | Description |
| :--- | :--- | :--- |
| `boxNum` | `string` or `number` | The number of the box to unlock. |

**Example Usage**
This function parses the API response and returns a user-friendly message in Japanese indicating success or failure.

```javascript
function openLockerSample() {
  const boxNumber = '3';
  const message = unlockLocker(boxNumber);
  // The message will be in Japanese.
  // e.g., "解錠しました。荷物を取り出してください。" (Unlocked. Please retrieve your package.)
  Logger.log(message);
}
```

---

### 🧰 Low-Level API: `callApi(apiName, postParam)`

If you need to call API endpoints other than the provided samples, you can use this generic function. Refer to the KEYVOX API documentation and set the `apiName` and `postParam` accordingly.

**Parameters**
| Argument | Type | Description |
| :--- | :--- | :--- |
| `apiName` | `string` | The name of the API endpoint to call (e.g., `createLockPin`). |
| `postParam` | `string` | The request body to send to the API. It must be a string, typically created with `JSON.stringify()`. |


**Example Usage: (Assuming an API like `getLockList` exists)**
```javascript
function getListOfLocks() {
  // Note: This API endpoint is for illustrative purposes.
  // Please set apiName and postParam according to the actual API specification.
  const apiNameToCall = 'getLockList';
  const params = {
    page: 1,
    limit: 10
  };

  const response = callApi(apiNameToCall, JSON.stringify(params));
  if (response) {
    Logger.log(response.getContentText());
  }
}
```

## 📄 License

MIT License