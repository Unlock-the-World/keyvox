"use client"
import React, {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import './index.scss';
import type {RadioChangeEvent} from 'antd';
import {Card, Col, DatePicker, Form, message, Radio, Row,} from "antd";
import {CodeSandboxOutlined,} from '@ant-design/icons'
import moment from 'moment';
import {amount, getAvailableBoxes, saveOrder} from "@/client/services/locker";
import PageContainer from '@/components/PageContainer';
import {useTranslation} from 'react-i18next';
import {AvailableBoxType} from '@/types/availableBox';
import {BoxSizes, RoutePath} from '@/common/constant';
import locale from 'antd/es/date-picker/locale/ja_JP';
import 'dayjs/locale/ja';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const OperationPage: React.FC = () => {
    const router = useRouter();
    const {t} = useTranslation();
    const [startTime, setStartTime] = useState<dayjs| undefined | null>(dayjs());
    const [endTime, setEndTime] = useState<dayjs | undefined | null>(dayjs().add(1, 'days'));
    const [value, setValue] = useState('2');
    const [priceList, setPriceList] = useState([]);
    const [box, setBox] = useState<AvailableBoxType[]>([]);
    const [smallBoxes, setSmallBoxes] = useState([]);
    const [mediumBoxes, setMediumBoxes] = useState([]);
    const [largeBoxes, setLargeBoxes] = useState([]);

    //Retrieve the price based on the selected time and type
    const getPrice = useCallback(async () => {
        if (startTime && endTime){
            const days = getDays();
            if (days != '--' && days>-1 ){
                const result = await amount({
                    days: days || 1,
                    value: value,
                });
                if (result){
                    setPriceList(result.data);
                }
            }
        }
    }, [endTime, startTime, value]);

    //
    const getDays = ()=>{
        if (endTime && startTime){
            const diff =  endTime.diff(startTime)/1000;
            return diff / (60 * 60 * 24);
        }
        return '--';
    }

    //Retrieve available lockers and differentiate them based on the returned content into large, medium, and small
    const fetchData = useCallback(async () => {
        console.log('fetchData');

        if (!startTime || !endTime ){
            return;
        }
        const result = await getAvailableBoxes({
            deviceId: localStorage.getItem('deviceId') ?? '',
            sTime: startTime.unix(),
            eTime: endTime.unix(),
        });
        const groupedBoxes = result.data?.reduce((acc: any, box: any) => {
            if (!acc[box.boxSize]) {
                acc[box.boxSize] = [];
            }
            acc[box.boxSize].push(box);
            return acc;
        }, {});

        if (groupedBoxes) {
            setSmallBoxes(groupedBoxes["1"] ?? [] as AvailableBoxType[]);
            setMediumBoxes(groupedBoxes["2"] ?? [] as AvailableBoxType[]);
            setLargeBoxes(groupedBoxes["3"] ?? [] as AvailableBoxType[]);
        } else {
            setSmallBoxes([]);
            setMediumBoxes([]);
            setLargeBoxes([]);
        }
        setBox(result.data);
    }, [startTime, endTime]);

    useEffect(() => {
        getPrice();
        fetchData()
    }, [value, endTime, startTime, box?.length]);

    const save = async (size: any, price: any, index: any) => {
        const deviceId = localStorage.getItem('deviceId');
        const deviceName = localStorage.getItem('deviceName');

        if (!deviceId){
            return;
        }
        if (!startTime || !endTime ){
            return;
        }

        const days = getDays();
        if (days != '--' && days>-1 ){
            const res = await saveOrder({
                order_amount: price,
                endTime: endTime.unix(),
                startTime: startTime.unix(),
                boxSize: size,
                deviceId: deviceId,
                deviceName: deviceName ?? '',
                days: days,
                type: value,
            })
            if (res.code == '0') {
                await router.push(
                    {
                        pathname: RoutePath.boxPage,
                        query: {
                            orderId: res.data.id,
                        }
                    }
                )
            }
        }
    }

    const getAvailableBox = async (size: any, price: any, index: number) => {
        if (endTime == '' || startTime == '') {
            message.error(`${t("must_chose_rent_time")}`)
        } else if (smallBoxes.length == 0 && index == 0) {
            message.error(`${t("no_avaliable_small_box")}`)
        } else if (mediumBoxes.length == 0 && index == 1) {
            message.error(`${t("no_avaliable_medium_box")}`)
        } else if (largeBoxes.length == 0 && index == 2) {
            message.error(`${t("no_avaliable_large_box")}`)
        } else {
           await save(size, price, index,);
        }
    }

    const onChange = (e: RadioChangeEvent) => {
        setValue(e.target.value);
    };

    const onChangeStartTime=(e)=>{
        if (e && endTime && e.isAfter(endTime)){
            setStartTime(e);
            setEndTime(null);
        }else{
            setStartTime(e);
        }
    }

    const onChangeEndTime=(e)=>{
        setEndTime(e)
    }

    const renderNum = (index: any) => {
        return (
            <p>{t("rest")}:
                {index == 0 ? smallBoxes.length :
                    index == 1 ? mediumBoxes.length :
                        index == 2 ? largeBoxes.length : ''
                }
            </p>
        )
    }


    return (
        <PageContainer>
            <Card
                title={t("create_order")}
                bordered={false}
                className='card-style'
            >
                <Form>
                    <Row>
                        <Col span={12}>
                            <Form.Item label={t("start_time")}>
                                <DatePicker locale={locale}
                                            value={startTime}
                                            onChange={onChangeStartTime}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("end_time")}>
                                <DatePicker value={endTime}
                                            locale={locale}
                                            disabledDate={(currentDate: dayjs)=>{
                                                if (!startTime){
                                                    return false;
                                                }
                                                return currentDate.isBefore(startTime);
                                            }}
                                            onChange={onChangeEndTime}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label={t("use_days")}>
                        {getDays() || '1'}日
                    </Form.Item>
                    <Form.Item>
                        <Radio.Group onChange={onChange} defaultValue={2}>
                            <Radio value={1}>{t("once_store")}</Radio>
                            <Radio value={2}>{t("long_store")}</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
                <Row gutter={16} style={{marginTop: '30px'}}>
                    {BoxSizes.map((size, index) => (
                        <Col key={index} span={8}>
                            <div>
                                <Card
                                    onClick={() => getAvailableBox(size.value, priceList && priceList.length > index ? priceList[index] : null, index)}
                                    hoverable={true}
                                    className='innerCardStyle'
                                >
                                    <p style={{textAlign: 'center'}}>
                                        <CodeSandboxOutlined className='iconStyle'/>
                                    </p>
                                    <p style={{textAlign: "center"}}>{size.label}</p>
                                    <div>
                                        {priceList && priceList.length>0 && (
                                                priceList.length >= index &&
                                                    ( <p key={index} style={{textAlign: "center"}}>
                                                    {priceList[index]} {t("price")}
                                                </p>)
                                        )}
                                    </div>
                                </Card>
                                <div style={{textAlign: 'center'}}>
                                    {
                                        startTime !== '' && endTime !== '' ?
                                            renderNum(index)
                                            : ''
                                    }
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card>
        </PageContainer>
    );
};

export default OperationPage;
