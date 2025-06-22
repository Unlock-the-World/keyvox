/**
 * get units
 * @param params
 * @return {Promise<void>}
 */
import {executeClient} from "@/client/common/execute";
import {ClientApi} from "@/client/common/constant";
import { LockerType } from "@/types/locker";
import { AvailableBoxType } from "@/types/availableBox";
import { SaveType } from "@/types/save";
import { OrderType } from "@/types/order";



export async function getLockers():Promise<{code:string,data:LockerType[],msg:string}> {
    return executeClient(ClientApi.LOCKERS);
}


export async function getAvailableBoxes(params: { boxSize?: string, deviceId: string, sTime: number | string, eTime: number | string }):
    Promise<{code:string,data:AvailableBoxType[],msg:string}> {
    return executeClient(ClientApi.BOXES, params);
}


export async function createLockerPin(params: {
    deviceId: string,
    sTime: string | number,
    eTime: string | number,
    boxNum: string,
    checkIn: string,
    mode: string,
    reassign: string,
    pinCode: string,
    boxSize: string,
    boxName: string,
    paymentStatus?: number,
    orderAmount?: number | string,
    paidAmount?: number,
    targetName: string,
    deviceName: string,
}) {
    return executeClient(ClientApi.LOCKERPIN, params);
}


export async function login(area: string, phone: string, vcode: string) {
    return executeClient(ClientApi.LOGIN, {area, phone, vcode});
}


export async function queryOrderList():Promise<{code:string,data:OrderType[],msg:string}> {
    return executeClient(ClientApi.ORDER_LIST, {});
}

export async function queryOrderDetail(id: number | string):Promise<{code:string,data:OrderType}> {
    return executeClient(ClientApi.ORDER_DETAIL, {id});
}


export async function amount(params: {
    days: number | string,
    value: number | string
}):Promise<{code:string,data:[]}> {
    return executeClient(ClientApi.AMOUNT, params);
}


export async function saveOrder(params: {
    order_amount: number | string,
    endTime: number | string,
    startTime: number | string,
    boxSize: number | string,
    deviceId: number | string,
    deviceName: number | string,
    days: number | string,
    type: number | string,
}):Promise<{code:string,data:SaveType}> {
    return executeClient(ClientApi.ORDER_SAVE, params);
}


export async function cancelOrder(id: number | string):Promise<{code:string,data:string,msg?:string}> {
    return executeClient(ClientApi.ORDER_CANCEL, {id});
}
