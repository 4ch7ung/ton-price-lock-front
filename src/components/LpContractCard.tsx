import React from 'react';
import { Network } from '../hooks/useTonClient';
import { useLPContract } from '../hooks/useLPContract';
import { CopyButton } from './CopyButton';
import { fromNano } from '@ton/core';
import { useTonConnect } from '../hooks/useTonConnect';

interface LpContractCardProps {
  network: Network;
}

export const LpContractCard: React.FC<LpContractCardProps> = ({ network }) => {
  const {
    contractAddress: lpContractAddress,
    contractAddressFull: lpContractAddressFull,
    contractData: lpContractData,
    contractPrice: lpContractPrice,
    refresh: getPoolData,
    changeLPPrice
  } = useLPContract(network);

  const { connected } = useTonConnect(); 
  
  return (
    <div className="card">
    <div className="card-header">
      <span>LP contract</span>
      <button className="card-header-button" onClick={() => {
          getPoolData();
        } 
      }>
        Refresh
      </button>
    </div>
    <div className="card-item">
      <div className="card-item-title">
        Address
      </div>
      <div className="card-item-value card-item-container">
        <span>{lpContractAddress}</span>
        <CopyButton onClick={() => {
          navigator.clipboard.writeText(lpContractAddressFull ?? "");
        }} />
      </div>
    </div>

    <div className="card-item">
      <div className="card-item-title">
        USDT Reserve
      </div>
      <div className="card-item-value">
        {fromNano((lpContractData?.reserve0 ?? BigInt(0)) * BigInt(1000))} USDT
      </div>
    </div>

    <div className="card-item">
      <div className="card-item-title">
        TON Reserve
      </div>
      <div className="card-item-value">
        {fromNano(lpContractData?.reserve1 ?? BigInt(0))} TON
      </div>
    </div>

    <div className="card-item">
      <div className="card-item-container">
        <div>
          <div className="card-item-title">
            LP price
          </div>
          <div className="card-item-value">
            1 TON = {lpContractPrice.toFixed(2)} USDT
          </div>
        </div>
        {connected && (
          <button className="card-item-button" onClick={() => {
            const newPrice = prompt("Enter new price", lpContractPrice.toFixed(2));
            if (newPrice === null || newPrice == "") return;
            else {
              const price = parseFloat(newPrice);
              changeLPPrice(price);
            }
          }}>
            Change
          </button>
        )}
      </div>
    </div>
  </div>
  );
};