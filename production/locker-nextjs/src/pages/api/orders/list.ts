import {ResStatus} from "@/server/common/constant";
import DaoHelper from "@/server/dao";
import {getUserId} from "@/utils/auth";
import {Result} from "@/common/result";
import {Request, Response} from "express";
import {PartialModelObject} from "objection";
import Order from "@/server/dao/entity/order";

/**
 * handler
 * @param req
 * @param res
 */
export default async function handler(req: Request, res: Response) {
    const userId =  await getUserId(req);
    if (userId){
        const result:PartialModelObject<Order>[]| undefined = await DaoHelper.getInstance().getOrderListByUserId(userId);
        res.status(ResStatus.SUCCESS).json(Result.ok(result));
        return;
    }
    res.status(ResStatus.SUCCESS).json(Result.error("not found"));
}
