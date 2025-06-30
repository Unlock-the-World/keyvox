# 🔐 KEYVOX API Demo

This is a sample source code for the **KEYVOX API**.
It demonstrates how to generate the HMAC-SHA256 authentication signature required by the API and how to call various API endpoints (e.g., retrieving unit information, creating/changing PIN codes).
Examples are provided in Java, PHP, and JS (for Postman).

***API Documentation***
https://developers.keyvox.co

***How to obtain a KEYVOX API Key:***
https://keyvox.notion.site/API-44c489d8c97a4eba8a7fa0028c3b39a1?source=copy_link

## Table of Contents
- [Java](#java)
- [PHP](#php)
- [JS(Postman)](#jspostman)
- [Python](#python)

## Java

### Included Files

- **HMAC Authentication Utility (`HttpUtils.java`)**:
  - Generates an HMAC-SHA256 signature based on `date`, `request-line`, and `digest`.
  - Automatically assembles the `Authorization` header and sends an HTTP POST request.
- **API Test Execution Class (`TestFunction.java`)**:
  - Provides test methods corresponding to each API function.
  - You can run all defined tests at once just by executing the `main` method.
- **Easy Setup with Maven**:
  - The necessary libraries are defined in `pom.xml`, which automatically resolves dependencies.

### Prerequisites

To run this project, you will need the following:

- **JDK (Java Development Kit)**: Version 8 or higher
- **Apache Maven**: Used for building and managing dependencies.
- **API Key & Secret**: Your API key and secret key for the KEYVOX API.

### Setup Instructions

1.  **Set up API Credentials**
    Open the `src/main/java/main/java/api/utils/TestFunction.java` file and replace the placeholders with your own API key and secret.

    ```java
    // TestFunction.java

    public class TestFunction{
        // ... (code omitted) ...

        // Your API Key
        private static final String apikey = "Enter your API key here";
        private static final String secret = "Enter your secret key here";

        // ... (code omitted) ...
    }
    ```

2.  **Build the Project**
    Run the following command in the project's root directory.
    Maven will automatically download the necessary libraries (dependencies) and compile the project.

    ```sh
    mvn compile
    ```
    Setup is complete when `BUILD SUCCESS` is displayed in the console.

### How to Run

#### Running All Tests

When you run the following command, all methods defined in `TestFunction.java` whose names start with `test` will be executed sequentially.

```sh
mvn exec:java
```

After execution, the content of each API request and the response from the server will be output to the console.

#### Running a Specific Test

If you want to try only a specific API call, directly edit the `main` method in `TestFunction.java`.

```java
// Example of modifying the main method in TestFunction.java

public static void main(String[] args) {
    // Comment out the original batch execution code,
    // and directly call the test method you want to run.

    // Example: Test only PIN code creation
    testCreateLockPin();

    // Example: Test only retrieving the list of units
    // testGetUnits(); 
}
```
After editing, run the `mvn exec:java` command again.

## PHP

### Prerequisites

To run this script, you need the following environment:

- **PHP**: Version 7.4 or higher is recommended
- **Composer**: PHP package manager (used to install the `Requests for PHP` library)
- **API Key & Secret**: Your API key and secret key for the KEYVOX API.

### Setup Instructions

1.  **Install Dependencies**
    In your terminal, navigate to the directory where you saved `api_test.php` and run the following command to install the `Requests for PHP` library.

    ```sh
    composer require rmccue/requests
    ```
    This will generate a `vendor` directory, a `composer.json` file, and a `composer.lock` file.

2.  **Modify the Script**
    Add the following line to the **very top** of `api_test.php` to load the Composer autoloader.

    ```php
    require 'vendor/autoload.php'; // Add this line
    ```

3.  **Set up API Credentials**
    In `api_test.php`, replace the values of `$api_key` and `$secret_key` with your own.

### How to Run

Once the setup is complete, run the script from your terminal with the following command.

```sh
php api_test.php
```

After execution, the response from the API server will be formatted and printed to the console.

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

### Trying Other APIs

To try APIs other than `/getUnits` (e.g., `/createLockPin`), modify the following parts of `api_test.php`:

1.  **Change the API Path**: Change the `$api_path` variable to the endpoint name of the API you want to call.
2.  **Change the Request Body**: Set the parameters required by the API in the `$jdata` variable in JSON format.

## JS (for Postman)

### Prerequisites

To use this collection, you will need the following:

- **Postman Desktop App**: [Download](https://www.postman.com/downloads/) and install it from the official website.
- **API Key & Secret**: Your API key and secret key for the KEYVOX API.

### How to Use

1.  In each request's **Pre-request Script** tab, change the `apiKey` and `secret` to your own.
2.  In the same script, set the parameters required by the API in the `postParam` variable as a JSON-formatted string.
3.  Launch the Postman app and import the provided JSON file using the "Import" button in the top-left. A collection named `BCL20230207` will be added to your sidebar.
4.  Select the request you want to test and click the "**Send**" button. The authentication process will run automatically in the background.

#### Example Response

If successful, the response from the API server will be displayed in the response panel at the bottom.
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

### How to Use

1.  Replace the apiKey and secret in the script with your own credentials.
2.  Several API methods are provided in the KeyvoxApiClient class. Add new methods as needed.
3.  In the main block (if __name__ == "__main__":), execute your desired API method with the appropriate input parameters.
4.  Upon successful execution, the response from the API server will be printed.

## 📄 License

MIT License