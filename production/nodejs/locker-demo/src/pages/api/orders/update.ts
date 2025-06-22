import {ResStatus} from "@/server/common/constant";
import DaoHelper from "@/server/dao";
import {getUserId} from "@/utils/auth";
import {Result} from "@/common/result";
import {Request, Response} from "express";

/**
 * handler
 * @param req
 * @param res
 */
export default async function handler(req: Request, res: Response) {
    const userId =  await getUserId(req);
    if (userId){
        req.body['userId'] = userId;
    }
    try {
        const result = DaoHelper.getInstance().updateOrder(req.body);
        res.status(ResStatus.SUCCESS).json(Result.ok(result));
    }catch (e){
        res.status(ResStatus.SUCCESS).json(Result.error("update order error"));
    }
}
