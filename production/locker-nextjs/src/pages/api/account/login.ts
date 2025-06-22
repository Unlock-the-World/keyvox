import {Api, ResCode, ResErrorMsg, ResStatus} from "@/server/common/constant";
import {getToken} from "@/utils/auth";
import {Result} from "@/common/result";
import {Request, Response} from "express";

/**
 * handler
 * @param req
 * @param res
 */
export default async function handler(req: Request, res: Response)  {
    try {
        verifyParams(req, res);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body || {}),
        };

        const { phone, area } = req.body;
        const response = await fetch(`${process.env.API_BASE_URL}${Api.API_VERIFY}` , options);

        const {code, msg} = await response.json() || {};
        //
        if (code === ResCode.SUCCESS ) {
            const token: string = await getToken(area, phone);
            const authorization: string =  `Bearer ${token}`;
            res.setHeader('Authorization', authorization); // 设置响应头，将令牌返回给客户端
            res.status(ResStatus.SUCCESS).json(Result.ok(authorization));
        } else {
            res.status(ResStatus.SUCCESS).json(Result.error(msg, code));
        }
    } catch (error: any) {
        res.status(ResStatus.SUCCESS).json(Result.error(error.message));
    }
}

/**
 * verify input params
 * @param req
 * @param res
 */
function verifyParams(req: Request, res: Response){
   const {area, phone, vcode} =  req.body || {};
   if ( !area || !phone || !vcode){
       throw new Error(ResErrorMsg.PARAMS);
   }
}
