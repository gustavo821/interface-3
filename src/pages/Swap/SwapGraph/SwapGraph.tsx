import { Trans } from '@lingui/macro';
import { DateTime } from 'luxon';
import React, { useCallback, useState } from 'react';
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts';

import { useObservable } from '../../../common/hooks/useObservable';
import { AmmPool } from '../../../common/models/AmmPool';
import { TokenIconPair } from '../../../components/AssetIconPair/TokenIconPair';
import { DateTimeView } from '../../../components/common/DateTimeView/DateTimeView';
import { Truncate } from '../../../components/Truncate/Truncate';
import { Button, Flex, Tabs, Typography } from '../../../ergodex-cdk';
import { getPoolChartData } from '../../../network/ergo/api/poolChart/poolChart';
import { useActiveData } from './useActiveData';
import { useAggregatedByDateData } from './useAggregatedByDateData';
import { Period, usePeriodSettings } from './usePeriodSettings';
import { useTicks } from './useTicks';

interface SwapGraphProps {
  pool: AmmPool;
}

export const SwapGraph: React.FC<SwapGraphProps> = ({ pool }) => {
  const [defaultActivePeriod, setDefaultActivePeriod] = useState<Period>('D');
  const [isInverted, setInverted] = useState(false);
  const { durationOffset, timeFormat, tick, preLastFromNow, resolution } =
    usePeriodSettings(defaultActivePeriod);

  const ticks = useTicks(tick, durationOffset, preLastFromNow, [
    defaultActivePeriod,
  ]);
  const [rawData] = useObservable(
    () =>
      getPoolChartData(pool, {
        from: DateTime.now().minus(durationOffset).valueOf(),
        resolution,
      }),
    [pool.id, defaultActivePeriod],
    [],
  );
  const data = useAggregatedByDateData(rawData, ticks);

  const [activeData, setActiveData] = useActiveData(data);

  const formatXAxis = useCallback(
    (ts: number) => DateTime.fromMillis(ts).toLocaleString(timeFormat),
    [defaultActivePeriod],
  );

  return (
    <Flex col style={{ position: 'relative' }}>
      <Flex.Item marginTop={4} marginLeft={6} marginRight={4}>
        <Flex align="center">
          <TokenIconPair
            size="small"
            assetX={pool?.x.asset}
            assetY={pool?.y.asset}
          />
          <Flex.Item marginRight={1} marginLeft={1}>
            <Typography.Title level={4}>
              <Truncate>{pool?.x.asset.name}</Truncate> /{' '}
              <Truncate>{pool?.y.asset.name}</Truncate>
            </Typography.Title>
          </Flex.Item>
          <Flex.Item marginRight={2}>
            <Button size="small" onClick={() => setInverted(!isInverted)}>
              <Trans>Switch ratio</Trans>
            </Button>
          </Flex.Item>

          <Flex.Item marginLeft="auto">
            <Tabs
              defaultActiveKey={defaultActivePeriod}
              onChange={(key) => setDefaultActivePeriod(key)}
            >
              <Tabs.TabPane tab="D" key="D" />
              <Tabs.TabPane tab="W" key="W" />
              <Tabs.TabPane tab="M" key="M" />
              <Tabs.TabPane tab="Y" key="Y" />
            </Tabs>
          </Flex.Item>
        </Flex>
      </Flex.Item>
      {activeData && (
        <>
          <Flex align="flex-end">
            <Flex.Item marginLeft={6} marginRight={2}>
              <Typography.Title level={2}>
                {activeData.getRatio(isInverted).toString()}
              </Typography.Title>
            </Flex.Item>
            <Flex.Item marginBottom={0.5}>
              <Typography.Title level={4}>
                <Truncate>
                  {activeData.getRatio(isInverted).baseAsset.name}
                </Truncate>
                {' / '}
                <Truncate>
                  {activeData.getRatio(isInverted).quoteAsset.name}
                </Truncate>
              </Typography.Title>
            </Flex.Item>
          </Flex>
          <Typography.Text style={{ marginLeft: '24px' }} type="secondary">
            <DateTimeView type="datetime" value={activeData.date} />
          </Typography.Text>
        </>
      )}
      <Flex.Item marginLeft={6} marginRight={4}>
        <AreaChart
          width={624}
          height={320}
          data={data}
          reverseStackOrder
          onMouseMove={(state: any) => {
            setActiveData(state?.activePayload?.[0]?.payload);
          }}
          syncMethod="index"
          onMouseLeave={() => setActiveData(null)}
        >
          <YAxis
            dataKey={isInverted ? 'invertedPrice' : 'price'}
            type="number"
            domain={['auto', 'auto']}
            hide
          />
          <XAxis dataKey="ts" scale="time" tickFormatter={formatXAxis} />
          <defs>
            <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
              <stop
                stopColor="var(--ergo-primary-color-hover)"
                stopOpacity="0.5"
              />
              <stop
                offset="1"
                stopColor="var(--ergo-primary-color-hover)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <Tooltip wrapperStyle={{ display: 'none' }} formatter={() => null} />
          <Area
            dataKey={isInverted ? 'invertedPrice' : 'price'}
            stroke="var(--ergo-primary-color-hover)"
            fill="url(#gradientColor)"
          />
        </AreaChart>
      </Flex.Item>
    </Flex>
  );
};
