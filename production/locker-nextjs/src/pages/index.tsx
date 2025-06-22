"use client"
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import {Image, Row, Col, Card, Select, Button} from "antd";
import './index.scss';
import depositImg from '../assets/images/deposit.png';
import retrieveImg from '../assets/images/retrieve.png';
import {getLockers} from "@/client/services/locker";
import PageContainer from "@/components/PageContainer";
import {useTranslation} from 'react-i18next';
import {LockerType} from '@/types/locker';
import {RoutePath} from '@/common/constant';

const IndexPage: React.FC = () => {
    const router = useRouter();
    const {t} = useTranslation();
    const [currentLocker, setCurrentLocker] = useState<LockerType | null>(null);
    const [list, setList] = useState<LockerType[]>([]);
    const [loading, setLoading] = useState(false);
    const [clickable, setClickable] = useState(false);

    useEffect(() => {
        const elements = document.getElementsByClassName('grecaptcha-badge');
        const element = elements[0];
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
        getLockerList();
    }, [])


    const getLockerList = async () => {
        setLoading(true);
        const repo = await getLockers();
        setList(repo?.data || []);

        setLoading(false);
        if (repo && repo.data && repo.data.length>0){
            setClickable(true);
            const localDeviceId = getLocalDeviceId();
            if (localDeviceId){
                const existLocker = repo.data.find((item)=>item.deviceId === localDeviceId);

                if (existLocker){
                    saveCurrentLocker(existLocker);
                    return;
                }
            }
            saveCurrentLocker(repo.data[0]);
        }else{
            removeLocalLocker();
        }
    }

    const saveCurrentLocker = (locker: LockerType)=>{
        localStorage.setItem('deviceId', locker.deviceId);
        localStorage.setItem('deviceName', locker.deviceName);
        setCurrentLocker(locker);
    }

    const getLocalDeviceId = ()=>{
       return localStorage.getItem('deviceId');
    }

    const removeLocalLocker = ()=>{
        localStorage.removeItem('deviceId');
        localStorage.removeItem('deviceName');
        setCurrentLocker(null);
    }

    const deposit = async () => {
        await router.push(RoutePath.operatePage);
    }

    const retrieve = async () => {
        await router.push(RoutePath.ordersPage)
    }

    const CustomCard = ({onClick, icon, text}: { onClick: any; icon: any; text: any }) => (
        <Button className='custom-card-style' disabled={!clickable} onClick={onClick}>
            <div className='body-style'>
                {icon}
                <span className='fontStyle'>{text}</span>
            </div>
        </Button>
    );

    const handleChange = (selectedOption: any) => {
        const locker:LockerType = {deviceId:selectedOption.value, deviceName:selectedOption.label};
        saveCurrentLocker(locker);
    };

    const renderLockers = () => {
        if (currentLocker){
            return (
                <Select
                    style={{width: 200}}
                    defaultValue={currentLocker.deviceName!}
                    onChange={(value, option) => handleChange(option)}
                    options={list.map((item: LockerType) => ({label: item.deviceName, value: item.deviceId}))}
                />
            )
        }
        return null;

    }


    return (
        <PageContainer>
            <Card
                title={t('store_thing')}
                bordered={false}
                className='card-style'
                extra={
                    list.length > 0 && renderLockers()
                }
            >
                <Row gutter={30} justify='center'>
                    <Col span={12}>
                        <CustomCard onClick={deposit}
                                    icon={<Image src={depositImg.src} alt='depositImg' height={100} preview={false}/>}
                                    text={t("pre_store")}/>
                    </Col>
                    <Col span={12}>
                        <CustomCard onClick={retrieve}
                                    icon={<Image src={retrieveImg.src} alt='retrieveImg' height={100} preview={false}/>}
                                    text={t("take_thing")}/>
                    </Col>
                </Row>
            </Card>
        </PageContainer>
    )
};

export default IndexPage;
