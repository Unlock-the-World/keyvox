import {execute} from "@/server/common/execute";
import {Api} from "@/server/common/constant";


/**
 * get units
 * @param params
 * @return {Promise<void>}
 */
export async function getUnits() {
    return execute(Api.API_GET_UNITS);
}

/**
 * get lockers
 * @param params
 * @return {Promise<void>}
 */
export async function getLockers() {
    return execute(Api.API_GET_LOCKERS);
}


/**
 * get available boxes
 * @param params
 * @return {Promise<void>}
 */
export async function getAvailableBoxes(params: { boxSize: string | number, deviceId: string, sTime: string | number, eTime: string | number }) {
    return execute(Api.API_GET_AVAILABLE_BOXES, params);
}


export async function getLockerStatus(params: { boxSize: string | number, deviceId: string, sTime: string | number, eTime: string | number }) {
    return execute(Api.API_GET_LOCKER_STATUS, params);
}

/**
 * create locker pin
 * @param params
 * @return {Promise<void>}
 */
export async function createLockerPin(params: {
    boxSize?: string,
    boxName?: string
    deviceId: string,
    boxNum: string,
    checkin: string,
    mode: string,
    reassign: string,
    pinCode: string,
    sTime: string | number,
    eTime: string | number,
    targetName: string,
    deviceName: string,
}) {
    return execute(Api.API_CREATE_LOCKER_PIN, params);
}
