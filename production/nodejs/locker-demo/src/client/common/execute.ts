import { stringify } from 'qs';
import request from "@/client/common/request";
import {ApiMethod} from "@/client/common/constant";


/**
 * execute http request
 * @param url
 * @param params
 * @param method
 */
export async function executeClient(apiName: string, params?: Object | null | undefined, method?: string | undefined ) {
    if (method === ApiMethod.GET){
        if (params === undefined || params === null){
            return request(apiName, {method: ApiMethod.GET});
        }
        return request(apiName, {method: ApiMethod.GET, params: stringify(params)});
    }
    return request(apiName, {
        method: method || ApiMethod.POST,
        body: params,
    });
}
