/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} apiName   The apiName we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
import {ApiMethod, ClientApi, codeMessage} from "@/client/common/constant";
import {message} from "antd";

import Router from "next/router"

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
            newOptions.body = JSON.stringify(newOptions.body);
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

    const acctoken = localStorage.getItem('token')
    if(acctoken!=null){
        newOptions.headers.Authorization = acctoken;
    }

    return fetch(url, newOptions)
        .then(response => {
            response
                .clone()
                .text()
                .then(text => {
                    try {
                        const data = JSON.parse(text);
                        if (data && data.code === 'E0000') {
                            Router.replace('/login');
                        }
                    } catch (e) {
                        console.warn(e);
                    }
                });
            return response.json();
        })
        .catch(e => {
            return;
        });
}

function checkStatus(data: any) {
    const code: number = data.code;
    if (code == 0 ) {
        return;
    }

    const msg:Map<string, string> = new Map([
        ['400', codeMessage["400"]],
        ['403', codeMessage["403"]],
        ['404', codeMessage["404"]],
        ['406', codeMessage["406"]],
        ['410', codeMessage["410"]],
        ['422', codeMessage["422"]],
        ['500', codeMessage["500"]],
        ['502', codeMessage["502"]],
        ['503', codeMessage["503"]],
        ['504', codeMessage["504"]],
    ]);

    const errorText = msg.get(`${code}`);
    if (errorText){
        message.error(errorText);
    }
}


/**
 * get api base url
 */
function getBaseUrl():string{
    return ClientApi.BASE_URL;
}

/**
 * get api path
 * @param url
 */
function getPath(url:string):string{
    if (!url.startsWith("/")) {
        url = `/${url}`;
    }
    return `${ClientApi.PATH}${url}`;
}

