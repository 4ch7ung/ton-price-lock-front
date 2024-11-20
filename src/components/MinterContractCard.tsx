import React from 'react';
import { Network } from '../hooks/useTonClient';
import { useMinterContract } from '../hooks/useMinterContract';
import { CopyButton } from './CopyButton';
import { Address, fromNano } from '@ton/core';
import { useTonConnect } from '../hooks/useTonConnect';

interface MinterContractCardProps {
  network: Network;
}

export const MinterContractCard: React.FC<MinterContractCardProps> = ({ network }) => {
  const {
    contractAddress,
    contractAddressFull,
    contractBalance,
    isOwner,
    refresh: getMinterData,
    sendMint,
    sendCollectProfits
  } = useMinterContract(network);

  const { connected } = useTonConnect();
  
  return (
    <div className="card"> 
      <div className="card-header">
        <span>Minter contract</span>
        <button className="card-header-button" onClick={() => {getMinterData()}}>
        Refresh
        </button>
      </div>
      <div className="card-item">
        <div className="card-item-title">
          Address
        </div>
        <div className="card-item-value card-item-container">
          <span>{contractAddress}</span>
          <CopyButton onClick={() => {
            navigator.clipboard.writeText(contractAddressFull ?? "");
          }} />
        </div>
      </div>
    
    {contractBalance !== null &&
      <div className="card-item">
        <div className="card-item-container">
          <div>
            <div className="card-item-title">
              Balance
            </div>
            <div className="card-item-value">
              {fromNano(BigInt(contractBalance ?? 0))} TON
            </div>
          </div>
        {(connected && isOwner && 
          <button className="card-item-button" onClick={() => {
            sendCollectProfits();
          }}>
            Collect
          </button>)
        }
        </div>
      </div>
    }
      <div className="card-item">
        <div className="card-item-container">
        {connected && (
          <button className="card-item-button" onClick={() => {
            const valueText = prompt("Enter amount to deposit", "0");
            if (valueText === null || valueText == "") return;
            const targetPriceText = prompt("Enter targer price", "0.00");
            if (targetPriceText === null || targetPriceText == "") return;

            const value = parseFloat(valueText);
            const targetPrice = parseFloat(targetPriceText);
            sendMint(targetPrice, value);
          }}>
            Deposit
          </button>
        )}
        </div>
      </div>
    </div>
  );
}