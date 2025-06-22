import {ResStatus} from "@/server/common/constant";
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
        const requestBody = req.body;
        if (userId){
            let prices = [];
            if(requestBody.value=='1'){
                 prices=[
                    requestBody.days*(parseInt(process.env.ONCE_SMALL_PRICE!)),
                    requestBody.days*(parseInt(process.env.ONCE_MEDIUM_PRICE!)),
                    requestBody.days*(parseInt(process.env.ONCE_LARGE_PRICE!)),
                ]
            }else{
                 prices=[
                    requestBody.days*(parseInt(process.env.SMALL_PRICE!)),
                    requestBody.days*(parseInt(process.env.MEDIUM_PRICE!)),
                    requestBody.days*(parseInt(process.env.LARGE_PRICE!)),
                ]
            }
            res.status(ResStatus.SUCCESS).json(Result.ok(prices));
        }

}
