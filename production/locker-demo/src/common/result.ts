import {ResCode} from "@/server/common/constant";


export class Result<T> {
    code: number| string = ResCode.SUCCESS;

    msg?: string | undefined = "success";

    data?: T | null;

    constructor() { }


    public static  ok<T>(data: T, msg?: string | undefined): Result<T> {
        const result = new Result<T>();
        result.data = data;
        result.msg = msg;
        return result;
    }

    public static  error<T>(msg: string, code: number| string = ResCode.ERROR_1): Result<T> {
        const result = new Result<T>();
        result.code = code;
        result.msg = msg;
        return result;
    }
}
