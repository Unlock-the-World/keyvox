"use client"
import React, {use, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {InputNumber, Image, Button, Form, Spin, message, Select, Card, Space} from 'antd';
import {useTranslation} from 'react-i18next';
import VerificationInput from "react-verification-input";
import {login} from "@/client/services/locker";
import PageContainer from "@/components/PageContainer";
import getConfig from 'next/config';
import './index.scss';
import { RoutePath } from '@/common/constant';


declare global {
    interface Window {
      grecaptcha: {
        enterprise: {
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
            ready: (callback: () => void) => void;
        };
      };
    }
  }

const LoginPage: React.FC = () => {
    const router = useRouter();
    const {t} = useTranslation();
    const {Option} = Select;
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verify, setVerify] = useState(false);
    const [inputCode, setInputCode] = useState('0');
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [area, setArea] = useState('81');
    const { publicRuntimeConfig } = getConfig();
    const siteKey = publicRuntimeConfig.googleKey;
    const getVcodeUrl = publicRuntimeConfig.loginApi;

    const onChange = (value: any) => {
        setPhoneNumber(value);
    };

    const onVcodeChange = (value: any) => {
        setInputCode(value);
    };


    useEffect(()=>{
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }, [siteKey]);

    useEffect(() => {
            const checkVcode = async () => {
                const result = await login('86', phoneNumber.toString(), inputCode);
                localStorage.setItem('token', result.data);
                console.log('result', result)
                if (result.code == '0') {
                    router.push(RoutePath.Home);
                }
            };
            if (inputCode.length === 6) {
                checkVcode();
            }
    }, [inputCode, router, phoneNumber]);



    const params = {
        stype: 'phone',
        sid: phoneNumber?.toString(),
        area: area,
        vtype: 'rstpwd',
        gtoken: 'token',
    }


    const getVcode = () => {
        const phoneNumberRegex = /^\d{11}$/;
        if (!phoneNumberRegex.test(phoneNumber)) {
            message.error(`${t("error_number")}`);
        } else {
            window.grecaptcha.enterprise.ready(() => {
                window.grecaptcha.enterprise.execute(siteKey, {action: 'vcode'}).then((token: any) => {
                    params.gtoken = token;
                    fetch(getVcodeUrl, {method: 'POST', body: JSON.stringify(params),})
                        .then((response) => {
                            return response.json();
                        })
                        .then(({code, msg}) => {
                            if (code === '0') {
                                message.success(msg).then(r => {});
                                setLoading(false);
                                setVerify(true);
                            } else {
                                message.error(msg);
                            }
                        })
                        .catch((error) => {
                            console.error('请求失败', error);
                        });
                });
            });
        }
    };

    const selectChange = (value: any) => {
        setArea(value);
        console.log('value', value)
    }




    // phoneNumber part
    const renderPhone = () => {
        return (
            <>
                <Card
                    className='card-style'
                    title={t("verify_phone_part")}
                    bordered={false}
                >
                    <div className='login-card'>
                        <Form form={form} layout='vertical'>
                            <Form.Item>
                                <Space.Compact>
                                    <Select
                                        size={"large"}
                                        defaultValue="81"
                                        onChange={selectChange}
                                    >
                                        <Option value="81">+81 {t("japan")}</Option>
                                        <Option value="86">+86 {t("china")}</Option>
                                        <Option value="65">+65 {t("singapore")}</Option>
                                        <Option value="62">+62 {t("indonesia")}</Option>
                                    </Select>
                                    <Form.Item
                                        name="phoneNumber"
                                        validateFirst
                                        rules={[
                                            {required: true, message: `${t("phone_must")}`},
                                            {pattern: /^[0-9]{11}$/, message: `${t("phone_num_check")}`},
                                        ]}
                                    >
                                        <InputNumber
                                            style={{fontSize: "14px", width: '220px'}}
                                            size={"large"} step={1} maxLength={11} placeholder={t("input_phone")}
                                            onChange={onChange}/>
                                    </Form.Item>
                                </Space.Compact>
                            </Form.Item>
                            <Button
                                type={"primary"}
                                size={"large"}
                                onClick={getVcode}>{t('getVcode')}</Button>
                        </Form>
                    </div>

                </Card>
            </>
        )
    }

    // Vcode part
    const renderVcode = () => {
        return (
            <>
                <Card
                     title={t("verify_phone_part")}
                    bordered={false}
                    className='card-style'
                >
                    <div className='login-card'>
                        <Form
                            style={{textAlign: 'center'}}
                            form={form}
                        >
                            <Form.Item
                                style={{height: '150px'}}
                                name="vcode"
                                validateFirst
                            >
                                <VerificationInput
                                    onChange={onVcodeChange}
                                />
                            </Form.Item>
                        </Form>
                    </div>
                </Card>

            </>
        )
    }

    return (
        <PageContainer>
            {!verify ? renderPhone() : renderVcode()}
            <Spin spinning={loading} tip={t("loading_text")}/>
        </PageContainer>
    );
};

export default LoginPage;
