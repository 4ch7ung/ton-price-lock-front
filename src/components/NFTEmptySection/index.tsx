import styles from './styles.module.css';

import { Ton } from '../../shared/icons/ton';
import { NFTCreateButton } from '../NFTCreateButton';

export const NFTEmptySection: React.FC = () => {
  return (
    <div className={styles.nftSection}>
      <Ton />
      <h2 className={styles.header}>CREATE YOUR FIRST FIXED-PROFIT NFT</h2>
      <ol className={styles.list}>
        <li>SET TARGET RATE</li>
        <li>ENTER TON AMOUNT</li>
        <li>MINT YOUR USDT-FIXED NFT</li>
      </ol>
      <NFTCreateButton>Create Fixed-Profit NFT</NFTCreateButton>
    </div>
  );
};
