import { TxId } from '@ergolabs/ergo-sdk';
import { Flex, Modal, ModalRef, Typography } from '@ergolabs/ui-kit';
import { RequestProps } from '@ergolabs/ui-kit/dist/components/Modal/presets/Request';
import { t, Trans } from '@lingui/macro';
import { DateTime } from 'luxon';
import React, { ReactNode } from 'react';
import { TimeoutError } from 'rxjs';

import { applicationConfig } from '../../applicationConfig';
import { ReactComponent as DiscordIcon } from '../../assets/icons/social/Discord.svg';
import { ReactComponent as TelegramIcon } from '../../assets/icons/social/Telegram.svg';
// import { panalytics } from '../../common/analytics';
import { AssetLock } from '../../common/models/AssetLock';
import { Currency } from '../../common/models/Currency';
import { exploreTx } from '../../gateway/utils/exploreAddress';
import { getLockingPeriodString } from '../../pages/Liquidity/utils';

export enum Operation {
  SWAP,
  ERGOPAY,
  ADD_LIQUIDITY,
  REMOVE_LIQUIDITY,
  REFUND,
  LOCK_LIQUIDITY,
  RELOCK_LIQUIDITY,
  WITHDRAWAL_LIQUIDITY,
  REQUEST_TESTNET_ASSET,
  CREATE_FARM,
  STAKE_LIQUIDITY_FARM,
  WITHDRAWAL_LIQUIDITY_FARM,
}

export interface ModalChainingPayload {
  xAsset?: Currency;
  yAsset?: Currency;
  lpAsset?: Currency;
  time?: DateTime;
  assetLock?: AssetLock;
}

const getDescriptionByData = (
  operation: Operation,
  { xAsset, yAsset, lpAsset, time, assetLock }: ModalChainingPayload,
): ReactNode => {
  switch (operation) {
    case Operation.ADD_LIQUIDITY:
      return xAsset && yAsset
        ? t`Adding liquidity ${xAsset.toCurrencyString()} and ${yAsset.toCurrencyString()}`
        : '';
    case Operation.REFUND:
      return xAsset && yAsset
        ? t`Refunding ${xAsset.toCurrencyString()} and ${yAsset.toCurrencyString()}`
        : '';
    case Operation.REMOVE_LIQUIDITY:
      return xAsset && yAsset
        ? t`Removing liquidity ${xAsset.toCurrencyString()} and ${yAsset.toCurrencyString()}`
        : '';
    case Operation.SWAP:
    case Operation.ERGOPAY:
      return xAsset && yAsset
        ? t`Swapping ${xAsset.toCurrencyString()} for ${yAsset.toCurrencyString()}`
        : '';
    case Operation.LOCK_LIQUIDITY:
      return xAsset && yAsset
        ? t`Locking ${xAsset.toCurrencyString()} and ${yAsset.toCurrencyString()} (${
            lpAsset && lpAsset.toString() + ' LP-assets'
          }) for ${time && getLockingPeriodString(time)}`
        : '';
    case Operation.RELOCK_LIQUIDITY:
      return t`Relocking ${assetLock?.x.toCurrencyString()} and ${assetLock?.y.toCurrencyString()} (${
        assetLock && assetLock.lp.toString() + ' LP-assets'
      })`;
    case Operation.CREATE_FARM:
      return t`Creating Farm`;
    case Operation.STAKE_LIQUIDITY_FARM:
      return xAsset && yAsset
        ? t`Stake ${xAsset.toCurrencyString()} and ${yAsset.toCurrencyString()} liquidity`
        : '';
    case Operation.WITHDRAWAL_LIQUIDITY_FARM:
      return xAsset && yAsset
        ? t`Withdraw ${xAsset.toCurrencyString()} and ${yAsset.toCurrencyString()}  liquidity`
        : '';
  }
};

const ProgressModalContent = (
  operation: Operation,
  payload: ModalChainingPayload,
) => {
  return (
    <Flex col align="center">
      <Flex.Item marginBottom={1}>
        <Typography.Title level={4}>
          <Trans>Waiting for confirmation</Trans>
        </Typography.Title>
      </Flex.Item>
      <Flex.Item marginBottom={1}>
        <Typography.Body align="center">
          {getDescriptionByData(operation, payload)}
        </Typography.Body>
      </Flex.Item>
      <Flex.Item marginBottom={1}>
        <Typography.Body secondary align="center">
          <Trans>Confirm this transaction in your wallet</Trans>
        </Typography.Body>
      </Flex.Item>
    </Flex>
  );
};

const ErrorModalContent = (
  operation: Operation,
  payload: ModalChainingPayload,
) => (
  <Flex col align="center">
    <Flex.Item marginBottom={1}>
      <Typography.Title level={4}>
        <Trans>Error</Trans>
      </Typography.Title>
    </Flex.Item>
    <Flex.Item marginBottom={1}>
      <Typography.Body align="center">
        {getDescriptionByData(operation, payload)}
      </Typography.Body>
    </Flex.Item>
    <Flex.Item marginBottom={1}>
      <Typography.Body align="center" secondary>
        <Trans>Transaction rejected</Trans>
      </Typography.Body>
    </Flex.Item>
    <Flex.Item marginBottom={1}>
      <Typography.Body align="center" secondary>
        <Trans>Try again later</Trans>
      </Typography.Body>
    </Flex.Item>
  </Flex>
);

const SuccessModalContent = (txId: TxId) => (
  <Flex col align="center">
    <Flex.Item marginBottom={1}>
      <Typography.Title level={4}>
        <Trans>Transaction submitted</Trans>
      </Typography.Title>
    </Flex.Item>
    <Flex.Item marginBottom={1}>
      <Typography.Link onClick={() => exploreTx(txId)}>
        <Trans>View on Explorer</Trans>
      </Typography.Link>
    </Flex.Item>
  </Flex>
);

const SuccessErgopayContent = (txId: TxId) => (
  <Flex col align="center">
    Test
    {/*<Flex.Item marginBottom={1}>*/}
    {/*  <Typography.Title level={4}>*/}
    {/*    <Trans>Transaction submitted</Trans>*/}
    {/*  </Typography.Title>*/}
    {/*</Flex.Item>*/}
    {/*<Flex.Item marginBottom={1}>*/}
    {/*  <Typography.Link onClick={() => exploreTx(txId)}>*/}
    {/*    <Trans>View on Explorer Ergopay</Trans>*/}
    {/*  </Typography.Link>*/}
    {/*</Flex.Item>*/}
  </Flex>
);

const YoroiIssueModalContent = () => (
  <Flex col align="center">
    <Flex.Item marginBottom={1}>
      <Typography.Title level={4}>
        <Trans>Error</Trans>
      </Typography.Title>
    </Flex.Item>
    <Flex.Item marginBottom={1}>
      <Typography.Body align="center">
        <Trans>Timeout error</Trans>
      </Typography.Body>
    </Flex.Item>
    <Flex.Item marginBottom={1}>
      <Typography.Body align="center">
        <Trans>Try again later</Trans>
      </Typography.Body>
    </Flex.Item>
    <Flex.Item marginBottom={1}>
      <Typography.Body align="center">
        <Trans>Get help in our channels:</Trans>
      </Typography.Body>
    </Flex.Item>
    <Flex.Item marginBottom={1} justify="center">
      <Flex>
        <Flex.Item marginRight={1}>
          <a
            style={{ color: 'var(--spectrum-primary-color)' }}
            href={applicationConfig.support.discord}
            target="_blank"
            rel="noreferrer"
            // onClick={() => panalytics.clickSocial('Discord', 'chaining-modal')}
          >
            <DiscordIcon style={{ cursor: 'pointer' }} />
          </a>
        </Flex.Item>
        <Flex.Item>
          <a
            style={{ color: 'var(--spectrum-primary-color)' }}
            href={applicationConfig.support.telegram}
            target="_blank"
            rel="noreferrer"
            // onClick={() => panalytics.clickSocial('Telegram', 'chaining-modal')}
          >
            <TelegramIcon style={{ cursor: 'pointer' }} />
          </a>
        </Flex.Item>
      </Flex>
    </Flex.Item>
  </Flex>
);

export const openConfirmationModal = (
  actionContent: RequestProps['actionContent'],
  operation: Operation,
  payload: ModalChainingPayload,
  onCancel?: () => void,
): ModalRef => {
  return Modal.request({
    actionContent,
    errorContent: (error: Error) => {
      if (error instanceof TimeoutError) {
        return YoroiIssueModalContent();
      }
      return ErrorModalContent(operation, payload);
    },
    progressContent: ProgressModalContent(operation, payload),
    successContent: (txId) => {
      return operation === Operation.ERGOPAY
        ? SuccessErgopayContent(txId)
        : SuccessModalContent(txId);
    },
    success:
      operation === Operation.ERGOPAY
        ? (txId) => SuccessErgopayContent(txId)
        : undefined,
    onCancel,
  });
};
