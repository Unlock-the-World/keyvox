import * as jose from 'jose';
import * as crypto from 'crypto-js';

const BUFFER_SIZE = 32;

function getJWTSecretConstant ():string{
    return process.env.JWT_SECRET || 'jwt_secret';
}

function getSecret(){
    const buffer = new ArrayBuffer(BUFFER_SIZE);
    const unit8array = new Uint8Array(buffer);
    const secret = jose.base64url.decode(getJWTSecretConstant());
    const secretLen = secret.length;
    for (let i=0; i<BUFFER_SIZE; i++){
        if (secretLen>i){
            unit8array[i] = secret[i];
        }else{
            unit8array[i] = 0;
        }
    }
    return unit8array;
}

export async function getToken(area: string, phone:string){
    const secret = getSecret();
    return await new jose.EncryptJWT({ area, phone })
        .setProtectedHeader({alg: 'dir', enc: 'A128CBC-HS256'})
        .setIssuedAt()
        .setIssuer(process.env.JWT_ISSUER??'urn:bcl:issuer')
        .setAudience(process.env.JWT_AUDIENCE??'urn:bcl:audience')
        .setExpirationTime(process.env.JWT_EXPIRESIN??'10d')
        .encrypt(secret);
}

export async function getUserId(request :any) {
    const authorization =  request?.headers['authorization'];
    const verifyData = await verifyToken(authorization);
    if (verifyData){
        const  {area, phone} = verifyData;
        if (area && phone){
            return `${area}${phone}`;
        }
    }
    return null;
}

export async function verifyToken(token :string | null){
    if (!token){
        return null;
    }
    try {
        token = token.replaceAll('Bearer ', '')
        const secret = getSecret();
        const { payload, protectedHeader } = await jose.jwtDecrypt(token, secret, {
            issuer: process.env.JWT_ISSUER??'urn:bcl:issuer',
            audience: process.env.JWT_AUDIENCE??'urn:bcl:audience',
        })
        return payload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export function encrypt(plainText :string){
    if (!plainText){
        return null;
    }
    const cipher = crypto.AES.encrypt(plainText, getJWTSecretConstant());
    return encodeURIComponent(cipher.toString());
}


export function decrypt(signData: null | string){
    if (!signData){
        return null;
    }
    const bytes  = crypto.AES.decrypt(decodeURIComponent(signData), getJWTSecretConstant());
    return bytes.toString(crypto.enc.Utf8);
}

