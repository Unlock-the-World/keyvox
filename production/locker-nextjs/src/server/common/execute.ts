import request from "@/server/common/request";
import { stringify } from 'qs';
import {ApiMethod} from "@/server/common/constant";

/**
 * execute http request
 * @param url
 * @param params
 * @param method
 */
export async function execute(apiName: string, params?: Object | null | undefined, method?: ApiMethod.GET | ApiMethod.POST | undefined ) {
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
