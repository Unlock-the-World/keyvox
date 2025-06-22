import {Api, ApiMethod, CodeMessage} from "@/server/common/constant";


export  interface RespData{
    code?: number;
    data?: any;
    message?: string;
}


export interface DataInType {
    gender?: string;
}

const crypto = require('crypto-js');
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} apiName   The apiName we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(apiName:string, option: any) {
    const options = {
        ...option,
    };

    let url = `${getBaseUrl()}${getPath(apiName)}`
    if(option.method === ApiMethod.GET && option.params){
        url = `${url}?${option.params}`;
    }

    const defaultOptions = {
        credentials: 'include',
    };
    const newOptions = { ...defaultOptions, ...options };
    if (
        newOptions.method === 'POST' ||
        newOptions.method === 'PUT' ||
        newOptions.method === 'DELETE'
    ) {
        if (!(newOptions.body instanceof FormData)) {
            newOptions.headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                ...newOptions.headers,
            };
        } else {
            // newOptions.body is FormData
            newOptions.headers = {
                Accept: 'application/json',
                ...newOptions.headers,
            };
        }
    } else {
        newOptions.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            ...newOptions.headers,
        };
    }

    const headers = getRequestHeaders(apiName, newOptions.body);
    // new headers
    newOptions.headers = {...newOptions.headers, ...headers};

    if (newOptions.method === ApiMethod.POST && !newOptions.body){
        newOptions.body = JSON.stringify({});
    }else{
        newOptions.body = JSON.stringify(newOptions.body);
    }

    return fetch(url, newOptions)
        .then(checkStatus)
        .then(response => {
            if (newOptions.method === 'DELETE' || response.status === 204) {
                return response.text();
            }
            return response.json();
        })
        .catch(e => {
            console.error(e);
            const errorResp: RespData = {};
            errorResp.code = e.name;
            errorResp.message = e.message;
            return errorResp;
        });
}

function checkStatus(response: Response) {
    if (response.status >= 200 && response.status < 400) {
        return response;
    }

    const msg:Map<string, string> = new Map([
        ['400', CodeMessage["ERROR_400"]],
        ['403', CodeMessage["ERROR_403"]],
        ['404', CodeMessage["ERROR_404"]],
        ['406', CodeMessage["ERROR_406"]],
        ['410', CodeMessage["ERROR_410"]],
        ['422', CodeMessage["ERROR_422"]],
        ['500', CodeMessage["ERROR_500"]],
        ['502', CodeMessage["ERROR_502"]],
        ['503', CodeMessage["ERROR_503"]],
        ['504', CodeMessage["ERROR_504"]],
    ]);

    const errorText = msg.get(`${response.status}`);
    const error = new Error(errorText);
    error.name = String(response.status);
    throw error;
};


/**
 * get new header
 * @param apiName
 * @param body
 */
function getRequestHeaders(apiName:string, body: Object | undefined | null){
    if (!body){
        body = {};
    }
    const headers: any = {};
    const date = new Date().toUTCString();
    const digest = getDigest(body);
    headers['x-target-host'] = 'default.pms';
    headers['api'] = apiName;
    headers['key'] = getApiKey();
    headers['authorization'] = getAuthorization(apiName, date, digest);
    headers['digest'] = digest;
    headers['date'] = `${date}`;
    return headers;
}

/**
 * get Signature
 * @param apiName
 * @param date
 * @param digest
 */
function getSignature(apiName: string, date: string, digest: string){
    const requestLine = "\nPOST /api/eagle-pms/v1/" + apiName +" HTTP/1.1";
    const stringToSign = String("date: " + date + requestLine + "\ndigest: " + digest);
    const hash = crypto.HmacSHA256(stringToSign, getApiSecret());
    const signToken = crypto.enc.Base64.stringify(hash);
    return signToken.toString();
}

/**
 * get Authorization
 */
function getAuthorization(apiName: string, date: string, digest: string){
    return `hmac username="${getApiKey()}", algorithm="hmac-sha256", headers="date request-line digest", signature="${getSignature(apiName, date, digest)}"`
}


/**
 * get digest
 */
function getDigest(params: Object | undefined | null):string{
    if (!params){
        params = {};
    }
    const paramHash = crypto.SHA256(JSON.stringify(params));
    const digestHash = crypto.enc.Base64.stringify(paramHash);
    const digest = "SHA-256=" + digestHash.toString();
    return digest || '';
}



/**
 * get ApiKey
 */
function getApiKey():string{
    return process.env.API_KEY || Api.API_KEY;
}


/**
 * get apiSecret
 */
function getApiSecret():string{
    return process.env.API_SECRET || Api.API_SECRET;
}

/**
 * get api base url
 */
function getBaseUrl():string{
    return process.env.BASE_URL || Api.API_BASE_URL;
}

/**
 * get api path
 * @param url
 */
function getPath(url:string):string{
    if (!url.startsWith("/")) {
        url = `/${url}`;
    }
    return `${Api.API_PATH}${url}`;
}

