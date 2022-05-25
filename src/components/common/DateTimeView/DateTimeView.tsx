import { DateTime } from 'luxon';
import React from 'react';

type DateTimeViewType = 'date' | 'time' | 'datetime';

interface DateTimeViewProps {
  type?: DateTimeViewType;
  value?: DateTime | null;
}

const formatMap: Record<DateTimeViewType, Intl.DateTimeFormatOptions> = {
  date: DateTime.DATETIME_MED,
  time: DateTime.TIME_SIMPLE,
  datetime: DateTime.DATE_FULL,
};

// TODO: Localize DateTime

const DateTimeView: React.FC<DateTimeViewProps> = ({
  type = 'date',
  value,
}) => {
  const format = formatMap[type] || DateTime.DATE_FULL;
  return <>{value?.toLocaleString(format)}</>;
};

export { DateTimeView };
