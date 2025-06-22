import {ResStatus} from "@/server/common/constant";
import {getUserId} from "@/utils/auth";
import {Result} from "@/common/result";
import DaoHelper from "@/server/dao";
import Order from "@/server/dao/entity/order";
import {PartialModelObject} from "objection";
import {Request, Response} from "express";

/**
 * handler
 * @param req
 * @param res
 */

export default async function handler(req: Request, res: Response) {
    const userId = await getUserId(req);
    if (userId) {
        const orderData: PartialModelObject<Order> = {
            userId: userId,
            orderAmount: req.body.order_amont,
            eTime: req.body.endTime,
            sTime:req.body.startTime,
            boxSize: req.body.boxSize,
            deviceName:req.body.deviceName,
            deviceId:req.body.deviceId,
            boxMode:req.body.type,
            days:req.body.days,
        };
      const result = await DaoHelper.getInstance().saveOrder(orderData);
      res.status(ResStatus.SUCCESS).json(Result.ok(result));
    }
  }
