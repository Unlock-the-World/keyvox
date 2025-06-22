import React, { ReactNode } from 'react';
import {Image} from "antd";
import logo from "@/assets/images/new_logo.png";
import Background from "@/components/Background";


interface PageContainerProps {
    children: ReactNode;
    offsetTop?: number;
  }

  const Index: React.FC<PageContainerProps> = ({offsetTop=12, children }) => {
    return (
      <div className='rootStyle'>
        <Background />
        <div className='page-container'>
          <div className='top-empty' style={{height:`${offsetTop}rem`}}></div>
          <div className='logo-container'>
            <Image
              src={logo.src}
              className="logo"
              alt='logo'
              preview={false}
            />
          </div>
          {React.Children.map(children, child => {
            return child;
          })}
        </div>
      </div>
    );
  };


export default Index;
