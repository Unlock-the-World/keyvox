import {getAvailableBoxes} from "@/server/services/locker";
import {ResStatus} from "@/server/common/constant";
import {Request, Response} from "express";

/**
 * handler
 * @param req
 * @param res
 */
export default async function handler(req: Request, res: Response) {
    const result = await getAvailableBoxes(req.body);
    res.status(ResStatus.SUCCESS).json(result);
}
