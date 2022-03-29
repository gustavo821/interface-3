import { Typography } from 'antd';
import React from 'react';

import { addresses$ } from '../../../../api/addresses';
import {
  isTransactionsHistorySyncing$,
  syncTransactionsHistory,
  transactionsHistory$,
} from '../../../../api/transactionsHistory';
import { useObservable } from '../../../../common/hooks/useObservable';
import {
  Box,
  Button,
  Flex,
  Menu,
  Modal,
  ReloadOutlined,
  Skeleton,
} from '../../../../ergodex-cdk';
import { isRefundableOperation } from '../../../../utils/ammOperations';
import { exploreTx } from '../../../../utils/redirect';
import {
  openConfirmationModal,
  Operation,
} from '../../../ConfirmationModal/ConfirmationModal';
import { DateTimeView } from '../../DateTimeView/DateTimeView';
import { OptionsButton } from '../../OptionsButton/OptionsButton';
import { InputOutputColumn } from '../InputOutputColumn/InputOutputColumn';
import { RefundConfirmationModal } from '../RefundConfirmationModal/RefundConfirmationModal';
import { TxStatusTag } from '../TxStatusTag/TxStatusTag';
import { TxTypeTag } from '../TxTypeTag/TxTypeTag';
import { Operation as DexOperation } from '../types';
import { normalizeOperations } from '../utils';
import { TxHistoryEmptyState } from './TxHistoryEmptyState';

const TxHistoryModal = (): JSX.Element => {
  const [isSyncing] = useObservable(isTransactionsHistorySyncing$);
  const [txs, txsLoading] = useObservable(transactionsHistory$);
  const [addresses] = useObservable(addresses$);

  const handleOpenRefundConfirmationModal = (operation: DexOperation) => {
    if (addresses) {
      openConfirmationModal(
        (next) => {
          return (
            <RefundConfirmationModal
              operation={operation}
              addresses={addresses}
              onClose={next}
            />
          );
        },
        Operation.REFUND,
        { xAsset: operation.assetX, yAsset: operation.assetY },
      );
    }
  };

  const renderTxActionsMenu = (op: DexOperation) => {
    return (
      <>
        <Menu.Item>
          <a
            onClick={() => exploreTx(op.txId)}
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer
          </a>
        </Menu.Item>
        {isRefundableOperation(op.status) && (
          <Menu.Item onClick={() => handleOpenRefundConfirmationModal(op)}>
            <a rel="noreferrer">Refund transaction</a>
          </Menu.Item>
        )}
      </>
    );
  };

  return (
    <>
      <Modal.Title>
        <Flex align="center">
          <Flex.Item marginRight={4}>Transaction history</Flex.Item>
          <Flex.Item>
            <Button
              loading={isSyncing}
              onClick={syncTransactionsHistory}
              icon={<ReloadOutlined />}
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
          </Flex.Item>
        </Flex>
      </Modal.Title>
      <Modal.Content width={680}>
        <Flex col style={{ overflowY: 'auto', maxHeight: '500px' }}>
          {!txsLoading ? (
            txs?.length ? (
              <>
                <Flex.Item>
                  <Flex justify="space-between" align="center">
                    <Flex.Item style={{ width: '35%' }}>
                      <Typography.Title level={5}>Assets</Typography.Title>
                    </Flex.Item>
                    <Flex.Item style={{ width: '28%' }}>
                      <Typography.Title level={5}>Date</Typography.Title>
                    </Flex.Item>
                    <Flex.Item style={{ width: '20%' }}>
                      <Typography.Title level={5}>Type</Typography.Title>
                    </Flex.Item>
                    <Flex.Item style={{ width: '16%' }}>
                      <Typography.Title level={5}>Status</Typography.Title>
                    </Flex.Item>
                    <Flex.Item style={{ width: '5%' }} />
                  </Flex>
                </Flex.Item>
                {normalizeOperations(txs)
                  .sort(
                    (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis(),
                  )
                  .map((op, index) => {
                    return (
                      <Flex.Item
                        key={index}
                        style={{
                          borderBottom:
                            '1px solid var(--ergo-default-border-color)',
                        }}
                      >
                        <Box transparent padding={[5, 0]} bordered={false}>
                          <Flex justify="space-between" align="center">
                            <Flex.Item style={{ width: '35%' }}>
                              <InputOutputColumn
                                type={op.type}
                                x={op.assetX}
                                y={op.assetY}
                              />
                            </Flex.Item>
                            <Flex.Item style={{ width: '28%' }}>
                              <DateTimeView value={op.timestamp} />
                              <br />
                              <DateTimeView type="time" value={op.timestamp} />
                            </Flex.Item>
                            <Flex.Item style={{ width: '20%' }}>
                              <TxTypeTag type={op.type} />
                            </Flex.Item>
                            <Flex.Item style={{ width: '16%' }}>
                              <TxStatusTag status={op.status} />
                            </Flex.Item>
                            <Flex.Item style={{ width: '5%' }}>
                              <OptionsButton placement="bottomLeft">
                                {renderTxActionsMenu(op)}
                              </OptionsButton>
                            </Flex.Item>
                          </Flex>
                        </Box>
                      </Flex.Item>
                    );
                  })}
              </>
            ) : (
              <TxHistoryEmptyState />
            )
          ) : (
            <Skeleton active>
              {/*TODO:REPLACE_WITH_ORIGINAL_LOADING[EDEX-476]*/}
            </Skeleton>
          )}
        </Flex>
      </Modal.Content>
    </>
  );
};

export { TxHistoryModal };
