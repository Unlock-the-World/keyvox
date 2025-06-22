import {Order, ResErrorMsg, ResStatus} from "@/server/common/constant";
import {getUserId} from "@/utils/auth";
import {Result} from "@/common/result";
import DaoHelper from "@/server/dao";
import {Request, Response} from "express";


/**
 * handler
 * @param req
 * @param res
 */

export default async function handler(req: Request, res: Response) {
    try {
        verifyParams(req, res);
        const userId =  await getUserId(req);
        if(userId){
            req.body.status = Order.STATUS_CANCEL;
            req.body.userId = userId;
        }
        const result = await DaoHelper.getInstance().updateOrder(req.body);
        res.status(ResStatus.SUCCESS).json(Result.ok(result));
    } catch (error:any) {
        res.status(ResStatus.SUCCESS).json(Result.error(error.message));
    }

  }


/**
 * verify input params
 * @param req
 * @param res
 */
function verifyParams(req: Request, res: Response){
    const {id} =  req.body || {};
    if ( !id){
        throw new Error(ResErrorMsg.PARAMS);
    }
}
