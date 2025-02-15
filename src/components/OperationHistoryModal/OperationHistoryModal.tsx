import {
  Button,
  Flex,
  Input,
  Modal,
  ModalRef,
  ReloadOutlined,
  SearchOutlined,
  Tooltip,
} from '@ergolabs/ui-kit';
import { t, Trans } from '@lingui/macro';
import React, { FC, useState } from 'react';
import styled from 'styled-components';

import { useObservable } from '../../common/hooks/useObservable';
import { filterOperations } from '../../common/models/Operation';
import { addresses$ } from '../../gateway/api/addresses';
import {
  getOperations,
  getSyncOperationsFunction,
  isOperationsSyncing$,
} from '../../gateway/api/transactionsHistory';
import { OperationHistoryTable } from './OperationHistoryTable/OperationHistoryTable';

const SearchInput = styled(Input)`
  width: 320px;
`;

export interface OperationHistoryModalProps extends ModalRef {
  readonly showDateTime?: boolean;
}

export const OperationHistoryModal: FC<OperationHistoryModalProps> = ({
  close,
  showDateTime,
}) => {
  const [operations, operationsLoading] = useObservable(getOperations(), []);
  const [addresses, addressesLoading] = useObservable(addresses$);
  const [isOperationsSyncing] = useObservable(isOperationsSyncing$);
  const [syncOperations] = useObservable(getSyncOperationsFunction());
  const [term, setTerm] = useState<string | undefined>();

  const filteredOperations = operations
    ? filterOperations(operations, term)
    : [];

  return (
    <>
      <Modal.Title>
        <Trans>Transaction history</Trans>
      </Modal.Title>
      <Modal.Content width={772}>
        <Flex col>
          <Flex.Item
            marginTop={2}
            marginBottom={4}
            display="flex"
            align="center"
          >
            <SearchInput
              size="large"
              onChange={(e) => setTerm(e.target.value)}
              prefix={<SearchOutlined />}
              placeholder={t`Search`}
            />
            {syncOperations && (
              <Flex.Item marginLeft={1} flex={1} justify="flex-end">
                <Tooltip
                  visible={isOperationsSyncing ? undefined : false}
                  title={
                    <Trans>
                      Synchronisation will continue even if you <br /> close
                      this modal window
                    </Trans>
                  }
                >
                  <Button
                    size="large"
                    loading={isOperationsSyncing}
                    onClick={() => syncOperations()}
                    icon={<ReloadOutlined />}
                  >
                    {isOperationsSyncing ? t`Syncing...` : t`Sync`}
                  </Button>
                </Tooltip>
              </Flex.Item>
            )}
          </Flex.Item>
          <OperationHistoryTable
            addresses={addresses || []}
            showDateTime={showDateTime}
            close={close}
            loading={operationsLoading || addressesLoading}
            emptyOperations={!operations?.length}
            emptySearch={!filteredOperations.length}
            operations={filteredOperations}
          />
        </Flex>
      </Modal.Content>
    </>
  );
};
