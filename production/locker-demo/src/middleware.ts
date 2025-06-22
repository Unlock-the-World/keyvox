import {NextRequest, NextResponse} from 'next/server'
import {verifyToken} from "@/utils/auth";
import {ResCode} from "@/server/common/constant";
import {Result} from "@/common/result";

export const config = {
    matcher: '/api/:function*',
}

export const excMatcher = ['/api/account/login'];

export default async function middleware(request: NextRequest) {
    const path  = request.nextUrl.pathname;
    if (!excMatcher.includes(path)){
       const authorization: string | null =  request.headers.get('authorization');
       const verifyData = await verifyToken(authorization);
       if (!verifyData){
          return  NextResponse.json(Result.error("ログインしていません", ResCode.ERROR_0))
       }
    }
}
