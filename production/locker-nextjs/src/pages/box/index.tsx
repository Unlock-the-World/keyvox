"use client"
import React, {  useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {Tooltip,Button, Spin,Col,Row, message,Empty,Card,Tag } from 'antd';
import './index.scss';
import QRCode from 'qrcode.react';
import {getAvailableBoxes,queryOrderDetail} from "@/client/services/locker";
import moment from 'moment';
import PageContainer from '@/components/PageContainer';
import Meta from "antd/es/card/Meta";
import { useTranslation } from 'react-i18next';
import { OrderType } from '@/types/order';
import { RoutePath } from '@/common/constant';

const AvaliableBoxPage: React.FC = () => {
    const router = useRouter();
    const {t} = useTranslation();
    const [qrCodeValue,setQrCodeValue] = useState('');
    const [orderId, setOrderId] = useState<string>((router.query.orderId ?? '') as string);
    const [errorStatus,setErrorStatus]= useState(false);
    const [boxData, setBoxData] = useState<OrderType>({
      deviceName: '',
      deviceId: '',
      boxSize: '',
      boxName: '',
      boxNum: '',
      pinCode: '',
      sTime: '0',
      qrCode: '',
      eTime: '0',
      boxMode: '',
      paymentStatus: '',
    });

    useEffect(() => {
      const detail = async() =>{
        const _res = await queryOrderDetail(parseInt(orderId));
        console.log('_res',_res);
        if(_res.data!==undefined){
          setBoxData(_res.data);
          setQrCodeValue(_res.data.qrCode??'');
        }else{
          setErrorStatus(true);
        }
      }
        setOrderId((router?.query?.orderId ??'') as string);
        if(orderId!=''){
          detail();
        }
    }, [router.query.orderId,orderId,]);


    const goBack =() =>{
      router.push(RoutePath.Home);
    }

    const getMore= () =>{
      router.push(RoutePath.operatePage);
    }

    const goToPay= async ()=>{
      const result = await getAvailableBoxes({
        deviceId:boxData?.deviceId??'',
        sTime:boxData?.sTime??'',
        eTime:boxData?.eTime??'',
        boxSize:boxData?.boxSize
      });
      if(result.data.length==0){
        message.error(t("no_box"));
      }else{
        router.push({
              pathname:RoutePath.paymentPage,
              query:{
                  id:orderId,
                  from:RoutePath.boxPage
              }}
          );
        }
    }

    const renderBoxSize = () =>{
      let size;
      if(boxData.boxSize=='1'){
        size=`${t("small")}`
      }else if(boxData.boxSize=='2'){
        size=`${t("medium")}`
      }else if(boxData.boxSize=='3'){
        size=`${t("large")}`
      }
      return(
        <Tag color='green'>{t("size")}&nbsp;&nbsp;{size}</Tag>
      )
    }

    const renderQrContainer = ()=>{
      return (
          <Row style={{display:'flex'}} gutter={10} className={boxData?.paymentStatus == '1' ? 'cleanQr' : 'blurQr'}>
              <Col span={4}></Col>
              <Col span={8}>
                  <QRCode style={{ border: '5px solid #ffffff'}} value={boxData?.qrCode?.toString() ?? ''}></QRCode>
              </Col>
              <Col span={12}>
                  <div className={'pin-code'}>
                      <Tooltip title={"箱格密码"}>
                          {boxData?.pinCode || '000000'}
                      </Tooltip>
                  </div>
                  <br />
                  <div className={'box-name'} >{`${boxData?.boxName}(${boxData?.boxNum})`}</div>
              </Col>
          </Row>
      )
  }


  const renderActions = ()=>{
    if (boxData?.paymentStatus !== '1'){
        return [
            <Button key={'pay'} type="link" onClick={()=>{goToPay()}}>
                <div style={{marginTop:'-10px', color:'#999'}}>{t("pay")}</div>
                <div style={{fontSize:'10px', color:'#999'}}>{t("pay_to_open")}</div>
            </Button>,
            <Button key={'back'} type="link"  onClick={()=>{(getMore())}}>
                <div style={{ color:'#999'}}>{t("get_more")}</div>
            </Button>
        ]
    }
}


const renderDescription = () => {
  const startTime = Number(boxData?.sTime ?? 0);
  const endTime = Number(boxData?.eTime ?? 0);

  return (
    <div style={{ marginTop: 5 }}>
      {moment.unix(startTime).format('YYYY-MM-DD HH:mm')}~{moment.unix(endTime).format('YYYY-MM-DD HH:mm')}
      <Tag color="blue">{boxData?.boxMode == '1' ? `${t("can_use_once")}` : `${t("can_use_long")}`}</Tag>
      {renderBoxSize()}
    </div>
  );
};


const renderPage= ()=>{
      return(
         <Card
                 style={{width:'100%'}}
                  bordered={false}
                  cover={
                    renderQrContainer()
                  }
                  actions={ renderActions()}
                  >
                    <Meta
                      title={boxData?.deviceName}
                      description= {renderDescription()}
                    />
         </Card>
      )
    }

    const  renderEmpty = ()=>{
      return(
        <>
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          imageStyle={{ height: 160 }}
          description={
            <span>{t("error_orderId")}</span>
          }
        >
        <Button type="primary" onClick={goBack}>{t("back")} </Button>
      </Empty>
      </>
      )

    }

    return (
      <PageContainer offsetTop={8}>

          <Card
              className='card-style'
              title={t("box_detail")}
              bordered={false}
              extra={<a className={'handler'} href={'/'}>{t("home")}</a>}
          >
              {
                  errorStatus || !orderId?
                      renderEmpty():
                      renderPage()
              }
          </Card>
      </PageContainer>
    );
};
export default AvaliableBoxPage;
