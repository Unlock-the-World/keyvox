
export interface OrderType{
    id?: number;
    userId?: string;
    deviceName?: string;
    deviceId?: string;
    boxNum?: string;
    boxName?: string;
    boxMode?: string;
    boxSize?: string;
    pinId?: string;
    pinCode?: string;
    sTime?: string;
    eTime?: string;
    days?: number;
    paymentStatus?: string;
    orderAmount?: number;
    paidAmount?: number;
    status?: string;
    qrCode?:string;
}
