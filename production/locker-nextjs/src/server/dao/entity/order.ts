import {Model} from "objection";

class Order extends Model{
    id?: number;
    userId?: string;
    deviceName?: string;
    deviceId?: string;
    boxNum?: string;
    boxName?: string;
    boxSize?: string;
    pinId?: string;
    pinCode?: string;
    qrCode?:string;
    sTime?: string;
    eTime?: string;
    paymentStatus?: string;
    orderAmount?: number;
    paidAmount?: number;
    days?:number;
    boxMode?:number;
    status?:string;

    static get tableName() {
        return 'locker_order';
    }

    static get primaryKey() {
        return 'id';
    }

    static get autoIncrement() {
        return true;
    }

    static get columnNameMappers() {
        return {
            parse<T>(obj: Record<string, any>): Record<string, T> {
                const parsed: Record<string, T> = {} as Record<string, T>;
                parsed['id'] = obj['id'];
                parsed['userId'] = obj['user_id'];
                parsed['deviceName'] = obj['device_name'];
                parsed['deviceId'] = obj['device_id'];
                parsed['boxNum'] = obj['box_num'];
                parsed['days'] = obj['days'];
                parsed['boxMode'] = obj['box_mode'];
                parsed['boxName'] = obj['box_name'];
                parsed['boxSize'] = obj['box_size'];
                parsed['pinId'] = obj['pin_id'];
                parsed['pinCode'] = obj['pin_code'];
                parsed['qrCode'] = obj['qr_code'];
                parsed['sTime'] = obj['s_time'];
                parsed['eTime'] = obj['e_time'];
                parsed['paymentStatus'] = obj['payment_status'];
                parsed['orderAmount'] = obj['order_amount'];
                parsed['paidAmount'] = obj['paid_amount'];
                parsed['status'] = obj['status'];
                return parsed;
            },

            format<T>(obj: Record<string, any>): Record<string, T> {
                const formatted: Record<string, T> = {} as Record<string, T>;
                formatted['id'] = obj.id;
                formatted['user_id'] = obj.userId;
                formatted['days'] = obj.days;
                formatted['device_name'] = obj.deviceName;
                formatted['box_mode'] = obj.boxMode;
                formatted['device_id'] = obj.deviceId;
                formatted['box_num'] = obj.boxNum;
                formatted['box_name'] = obj.boxName;
                formatted['box_size'] = obj.boxSize;
                formatted['pin_id'] = obj.pinId;
                formatted['pin_code'] = obj.pinCode;
                formatted['qr_code'] = obj.qrCode;
                formatted['s_time'] = obj.sTime;
                formatted['e_time'] = obj.eTime;
                formatted['payment_status'] = obj.paymentStatus;
                formatted['order_amount'] = obj.orderAmount;
                formatted['paid_amount'] = obj.paidAmount;
                formatted['status'] = obj.status;
                return formatted;
            },
        };
    }

}

export default Order;
