import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {Image, Button, Spin, List, message, Card, Avatar, Row, Col, Tooltip, Tag, Modal} from 'antd';
import './index.scss';
import QRCode from 'qrcode.react';
import moment from 'moment';
import {getAvailableBoxes, cancelOrder, queryOrderList} from "@/client/services/locker";
import PageContainer from "@/components/PageContainer";
import Meta from "antd/es/card/Meta";
import {OrderType} from "@/types/order";
import {ResCode} from "@/server/common/constant";
import {ExclamationCircleOutlined} from "@ant-design/icons";
import { useTranslation } from 'react-i18next';
import { RoutePath } from '@/common/constant';
const { confirm } = Modal;

const OrdersPage = () => {
    const router = useRouter();
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<OrderType[]>([]);

    useEffect(() => {
        getOrderList().then(r => {});
    }, []);

    // Query the order list of the current user
    const getOrderList = async ()  => {
        setLoading(true);
        const result = await queryOrderList();
        if (result?.code == ResCode.SUCCESS){
            setList(result.data || []);
        }
        setLoading(false);
    }

    // Confirm the cancellation of the order
    const confirmCancelOrder = (id: string | number)  => {
        confirm({
            title: t('tip'),
            icon: <ExclamationCircleOutlined />,
            content: t('cancel_msg'),
            okText: t('confirm'),
            cancelText: t('cancel'),
            onOk: ()=>{
               return doCancelOrder(id);
            },
        });
    }

    // Cancel the order
    const doCancelOrder = async (id: string | number)=>{
        const result = await cancelOrder(id);
        if (result?.code == ResCode.SUCCESS){
           await getOrderList();
        }else{
            message.error(result?.msg);
        }
    }

    // Payment of order amount
    const goToPay = async (order: OrderType) => {
        const result = await getAvailableBoxes({
            deviceId: order.deviceId!,
            sTime: order.sTime ?? '',
            eTime: order.eTime ?? '',
            boxSize: order.boxSize
        });

        if (result?.code == ResCode.SUCCESS && result.data?.length > 0){
            await router.push({
                    pathname: RoutePath.paymentPage,
                    query: {
                        id: order.id,
                        from: RoutePath.ordersPage,
                    }
                }
            );
        }else{
            message.warning('There is no available box');
        }
    }

    const renderQrContainer = (item:any) => {
        return (
            <Row gutter={10} className={`cover-row ${item?.paymentStatus == '1' ? 'cleanQr' : 'blurQr'}`}>
                <Col span={12}>
                    <QRCode style={{border: '5px solid #ffffff'}}
                            value={item?.qrCode?.toString() ?? 'https://keyvox.co'}></QRCode>
                </Col>
                <Col span={12}>
                    <div className={'pin-code'}>
                        <Tooltip title={"箱格密码"}>
                            {item?.pinCode || '000000'}
                        </Tooltip>
                    </div>
                    <div className={'box-name'}>{`${item?.boxName || '--'}(${item?.boxNum || '--'})`}</div>
                </Col>
            </Row>
        )
    }

    const renderDescription = (item:any) => {
        return (
            <div style={{marginTop: 5}}>
                {moment.unix(item?.sTime ?? 0).format('YYYY-MM-DD HH:mm')}~{moment.unix(item?.eTime ?? 0).format('YYYY-MM-DD HH:mm')}  <Tag color="blue">{item?.boxMode == '1' ? `${t("can_use_once")}` : `${t("can_use_long")}`}</Tag>
            </div>
        )
    }


    const renderActions = (item:any) => {
        if (item.paymentStatus !== '1') {
            return [
                <Button key={'pay'} type="text" onClick={async() => {
                    await goToPay(item);
                }}>
                    <div style={{marginTop:'-10px'}}>{t("pay")}</div>
                    <div style={{fontSize:'10px', color:'#999'}}>{t("pay_to_open")}</div>
                </Button>,
                <Button key={'cancel'} type="link" danger onClick={() => {
                    confirmCancelOrder(item.id)
                }}>
                    {t("cancel")}
                </Button>
            ]
        }
    }

    return (
        <PageContainer offsetTop={2}>
            <Card
                className='card-style'
                title={t("order_list")}
                bordered={false}
                extra={<a className={'handler'} href={'/'}>{t("back")}</a>}
            >
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={list}
                    split={false}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                style={{width: '100%'}}
                                cover={
                                    renderQrContainer(item)
                                }
                                actions={
                                    renderActions(item)
                                }
                            >
                                <Meta
                                    title={item?.deviceName}
                                    description={renderDescription(item)}/>
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>
        </PageContainer>
    );
};

export default OrdersPage;
