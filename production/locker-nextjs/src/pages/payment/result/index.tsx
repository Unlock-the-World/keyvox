import React, {useEffect, useState} from 'react';
import {Button, Card, Result} from 'antd';
import {GetStaticPaths} from 'next';
import DaoHelper from "@/server/dao";
import {createLockerPin, getAvailableBoxes} from "@/server/services/locker";
import {generateRandomPwd} from "@/utils/utils";
import {decrypt, encrypt} from "@/utils/auth";
import {useRouter} from "next/router";
import {RoutePath, Status} from "@/common/constant";
import {ResCode} from "@/server/common/constant";
import PageContainer from "@/components/PageContainer";
import { Translation } from 'react-i18next';

export interface CountdownTimerProps{
    endTime: number;
    status: string;
    linkFrom: string;
    linkOrderId: string;
    t: any;
}


export interface BackButtonProps{
    status: string;
    linkFrom: string;
    linkOrderId: string;
    t: any;
}

function CountdownTimer({endTime, status, linkFrom, linkOrderId, t}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(endTime);
    const router = useRouter();

  


    useEffect(() => {
        const startCountdownTimer = () => {
            const timer = setInterval(() => {
                setTimeLeft(endTime--);
                if (endTime < 1) {
                    clearInterval(timer);
                    if (!status && linkFrom){
                        router.replace(`${linkFrom}`).then(r => {});
                    }else if (linkFrom=='/box' && linkOrderId){
                        router.replace(`${linkFrom}?orderId=${linkOrderId}`).then(r => {});
                    }else if(linkFrom=='/orders'&&linkOrderId){
                        router.replace(`${linkFrom}`).then(r => {});
                    }
                }
            }, 1000);
        }
        startCountdownTimer();
    }, [endTime, status, linkFrom, linkOrderId, router]);



    return (
        <div>
            {t("countTimer")}{timeLeft}s
        </div>
    );
}

function BackButton ({linkFrom, status, linkOrderId, t}: BackButtonProps){
    const router = useRouter();
    const onBack = ()=>{
        if (!status && linkFrom){
            router.replace(`${linkFrom}`).then(r => {});
        } else if (linkFrom && linkOrderId){
            router.replace(`${linkFrom}?orderId=${linkOrderId}`).then(r => {});
        }
    }
    return (
        <Button key="back" onClick={onBack}>{t("back")}</Button>
    )
}


export async function getServerSideProps({query}: any) {
    const _signData = query._signData || '';
    if (!_signData) {
        return {props: { status: Status.Error, linkFrom:RoutePath.Home}};
    }

    let linkFrom = '';
    let linkOrderId= '';
    const decryptData = decrypt(_signData);  //解密undefined

    if (!decryptData){
      return {props: { status: Status.Error, linkFrom:RoutePath.Home}};
    }
    const {orderId, from} = JSON.parse(decryptData);

    linkFrom = from;
    linkOrderId = orderId;

    const orderModel = await DaoHelper.getInstance().getOrderById(orderId);

    if (orderModel) {
        orderModel.id = orderId;
        if (!orderModel.pinId) {
            const boxesRep = await getAvailableBoxes({
                boxSize: orderModel.boxSize!.toString(),
                deviceId: orderModel.deviceId!.toString(),
                sTime: orderModel.sTime!.toString(),
                eTime: orderModel.eTime!.toString(),
            });

            const boxes = boxesRep.data;

            if (boxesRep.code == ResCode.SUCCESS && boxes && boxes.length > 0) {
                const randomIndex = Math.floor(Math.random() * boxes.length);
                const randomItem = boxes[randomIndex];
                const result = await createLockerPin({
                        boxSize: orderModel.boxSize!.toString(),
                        boxName: randomItem.boxName,
                        deviceId: orderModel.deviceId!.toString(),
                        sTime: orderModel.sTime!.toString(),
                        eTime: orderModel.eTime!.toString(),
                        boxNum: randomItem.boxNum,
                        deviceName: orderModel.deviceName!.toString(),
                        checkin: '1',
                        mode: orderModel.boxMode!.toString(),
                        reassign: '0',
                        pinCode: generateRandomPwd(),
                        targetName: orderModel.deviceName!.toString()
                    }
                );

                if (result.code == '0') {
                    const {data} = result;
                    orderModel.paymentStatus = '1';
                    orderModel.pinId = data.pinId;
                    orderModel.pinCode = data.pinCode;
                    orderModel.qrCode = data.qrCode;
                    orderModel.boxName = randomItem.boxName;
                    orderModel.boxNum = randomItem.boxNum;
                }
            }
        }
        orderModel.paymentStatus = '1';
        await DaoHelper.getInstance().updateOrder(orderModel);
    }
    return {props: {linkFrom, status:Status.Success, linkOrderId}}
}


export default class ResultPage extends React.Component<any, any> {
    render() {
        return (
            <Translation>
                {
                    t=>{
                        return (
                            <PageContainer>
                                <Card
                                    className='card-style'
                                    title={t("payment_result")}
                                    bordered={false}
                                >
                                    <Result
                                        status={this.props.status?"success":"error"}
                                        title={this.props.status?"Payment successful":"Error"}
                                        subTitle={<CountdownTimer endTime={ 5 } linkFrom={this.props.linkFrom} status={this.props.status} linkOrderId={this.props.linkOrderId} t={t}/>}
                                        extra={[
                                            <BackButton key={'back'} linkFrom={this.props.linkFrom} status={this.props.status} linkOrderId={this.props.linkOrderId} t={t}/>
                                        ]}
                                    />
                                </Card>
                            </PageContainer>
                        )
                    }
                }
            </Translation>
        )
    }
}
