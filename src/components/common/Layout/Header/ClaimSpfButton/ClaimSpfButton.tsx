import { Button, Modal, ModalRef } from '@ergolabs/ui-kit';
import { t } from '@lingui/macro';
import React, { FC, MouseEvent, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import styled from 'styled-components';

import { useObservable } from '../../../../../common/hooks/useObservable';
import { localStorageManager } from '../../../../../common/utils/localStorageManager';
import { isWalletSetuped$ } from '../../../../../gateway/api/wallets';
import { spfReward$ } from '../../../../../network/ergo/api/spfFaucet/spfReward';
import {
  LAST_STAGE,
  SpfStatus,
  spfStatus$,
} from '../../../../../network/ergo/api/spfFaucet/spfStatus';
import { ReactComponent as BottomBackground } from './bottom-background.svg';
import { ClaimSpfModal } from './ClaimSpfModal/ClaimSpfModal';
import {
  hideClaimSpfNotification,
  openClaimSpfNotification,
} from './ClaimSpfNotification/ClaimSpfNotification';
import { ReactComponent as TopBackground } from './top-background.svg';

const StyledButton = styled(Button)`
  cursor: pointer !important;
  overflow: hidden;
  position: relative;
`;

const TopBackgroundContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

const BottomBackgroundContainer = styled.div`
  position: absolute;
  left: 0;
  top: -2px;
`;

const CLAIM_FINISHED = 'CLAIM_FINISHED';

export const ClaimSpfButton: FC = () => {
  const [claimSpfStatus] = useObservable(spfStatus$);
  const [claimSpfReward] = useObservable(spfReward$);
  const [isWalletConnected] = useObservable(isWalletSetuped$);
  const [confetti, setConfetti] = useState<boolean>(false);
  const [modalRef, setModalRef] = useState<ModalRef | undefined>();
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (
      claimSpfStatus &&
      claimSpfStatus.stage === LAST_STAGE &&
      claimSpfStatus.status === SpfStatus.Claimed &&
      !localStorageManager.get(CLAIM_FINISHED)
    ) {
      setConfetti(true);
    }
  }, [claimSpfStatus]);

  useEffect(() => {
    if (!confetti) {
      return;
    }
    if (modalRef) {
      modalRef.close();
    }
    openClaimSpfModal();
  }, [confetti]);

  useEffect(() => {
    if (
      claimSpfStatus &&
      claimSpfReward &&
      claimSpfStatus.status === SpfStatus.Init &&
      claimSpfReward.available.isPositive()
    ) {
      openClaimSpfNotification(
        claimSpfStatus,
        claimSpfReward,
        openClaimSpfModal,
      );
    } else {
      hideClaimSpfNotification();
    }
  }, [claimSpfStatus, claimSpfReward]);

  const openClaimSpfModal = (e?: MouseEvent<any>) => {
    if (e) {
      e.stopPropagation();
    }
    const modalRef = Modal.open(
      ({ close }) => <ClaimSpfModal gotIt={confetti} close={close} />,
      {
        afterClose: () => {
          setModalRef(undefined);
          if (confetti) {
            setConfetti(false);
            localStorageManager.set(CLAIM_FINISHED, true);
          }
        },
      },
    );
    setModalRef(modalRef);
  };
  return (
    <>
      {confetti && isWalletConnected && (
        <Confetti width={width} height={height} />
      )}
      {claimSpfStatus && claimSpfReward && isWalletConnected && (
        <div onClick={openClaimSpfModal}>
          <StyledButton
            type="primary"
            size="large"
            loading={
              claimSpfStatus.status === SpfStatus.Pending ||
              claimSpfStatus.status === SpfStatus.WaitingConfirmation
            }
          >
            <TopBackgroundContainer>
              <TopBackground />
            </TopBackgroundContainer>
            <BottomBackgroundContainer>
              <BottomBackground />
            </BottomBackgroundContainer>
            {claimSpfStatus.status === SpfStatus.Pending ||
            claimSpfStatus.status === SpfStatus.WaitingConfirmation
              ? t`Claiming...`
              : t`Claim SPF`}
          </StyledButton>
        </div>
      )}
    </>
  );
};
