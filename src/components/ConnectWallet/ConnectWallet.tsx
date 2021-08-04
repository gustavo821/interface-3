import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Button } from '@geist-ui/react';
import { WalletContext } from '../../context';
import { toast } from 'react-toastify';
import { ERG_DECIMALS, ERG_TOKEN_NAME } from '../../constants/erg';
import { renderFractions } from '../../utils/math';
import Cookies from 'js-cookie';

export const ConnectWallet = (): ReactElement => {
  const { isWalletConnected, setIsWalletConnected } = useContext(WalletContext);
  const [ergBalance, setErgBalance] = useState('');

  useEffect(() => {
    if (isWalletConnected) {
      ergo.get_balance(ERG_TOKEN_NAME).then((balance) => {
        setErgBalance(renderFractions(Number(balance), ERG_DECIMALS));
      });
    }
  }, [isWalletConnected]);

  const onClick = useCallback(() => {
    if (window.ergo_request_read_access) {
      Cookies.set('wallet-connected', 'true', { expires: 1 });
      window
        .ergo_request_read_access()
        .then(setIsWalletConnected);
      return;
    }

    toast.warn(
      "Yoroi Nightly and/or Yoroi-dApp-Connector Nightly aren't installed",
    );
  }, [setIsWalletConnected]);

  return (
    <Button type="success" ghost onClick={onClick}>
      {isWalletConnected ? `${ergBalance} ERG` : 'Connect Yoroi Wallet'}
    </Button>
  );
};
