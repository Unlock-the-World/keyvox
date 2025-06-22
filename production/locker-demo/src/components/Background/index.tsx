"use client"
import React from 'react';
import './index.scss';

const Index: React.FC = () => {
  return (
    <div style={{display: 'flex', justifyContent: 'center',}}>
      <div className="back-container">
        <div className="top-right-circle"></div>
        <div className="center-right-circle"></div>
        <div className="top-left">
          <div className="bckSection">
          </div>
        </div>
        <div className="bottom-right"></div>
      </div>
    </div>
  );
};

export default Index;
