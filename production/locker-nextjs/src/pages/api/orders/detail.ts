import {ResStatus} from "@/server/common/constant";
import {getUserId} from "@/utils/auth";
import {Result} from "@/common/result";
import DaoHelper from "@/server/dao";
import {Request, Response} from "express";
import {PartialModelObject} from "objection";
import Order from "@/server/dao/entity/order";

/**
 * handler
 * @param req
 * @param res
 */

export default async function handler(req: Request, res: Response) {
      const orderModel:PartialModelObject<Order>| undefined  = await DaoHelper.getInstance().getOrderById(parseInt(req.body.id));
      res.status(ResStatus.SUCCESS).json(Result.ok(orderModel));
  }
