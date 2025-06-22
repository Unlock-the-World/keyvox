import {createLockerPin} from "@/server/services/locker";
import {ResStatus} from "@/server/common/constant";
import {getUserId} from "@/utils/auth";
import DaoHelper from "@/server/dao";
import {Request, Response} from "express";

/**
 * handler
 * @param req
 * @param res
 */
export default async function handler(req: Request, res: Response) {
    const result = await createLockerPin(req.body);
    res.status(ResStatus.SUCCESS).json(result);
}
