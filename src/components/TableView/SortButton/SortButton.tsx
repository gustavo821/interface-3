import { CaretDownOutlined, CaretUpOutlined, Flex } from '@ergolabs/ui-kit';
import React, { FC } from 'react';
import styled from 'styled-components';

import { SortDirection } from '../common/Sort';

export interface SortButtonProps {
  readonly direction: SortDirection | undefined;
  readonly changeDirection: (direction: SortDirection | undefined) => void;
  readonly className?: string;
}

const _SortButton: FC<SortButtonProps> = ({
  className,
  changeDirection,
  direction,
}) => {
  const handleClick = () => {
    if (direction === SortDirection.DESC) {
      changeDirection(SortDirection.ASC);
      return;
    }
    if (direction === SortDirection.ASC) {
      changeDirection(undefined);
      return;
    }
    changeDirection(SortDirection.DESC);
  };

  return (
    <Flex col className={className} onClick={handleClick}>
      <CaretUpOutlined />
      <CaretDownOutlined />
    </Flex>
  );
};

export const SortButton = styled(_SortButton)`
  cursor: pointer;

  .anticon:first-child {
    color: ${(props) =>
      props.direction === SortDirection.ASC && 'var(--spectrum-primary-color)'};
  }

  .anticon:last-child {
    color: ${(props) =>
      props.direction === SortDirection.DESC &&
      'var(--spectrum-primary-color)'};
  }

  .anticon {
    color: var(--spectrum-table-view-column-icon);
    font-size: 10px;
  }
`;
