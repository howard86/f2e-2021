'use client';

import { Button } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import type { PlaceDetail } from '@/types/place';
import { buildIcs } from './helpers';

type CalendarButtonProps = Pick<
  PlaceDetail,
  'calendar' | 'description' | 'id' | 'name'
> & { location?: string };

const CalendarButton = ({
  calendar,
  description,
  id,
  location,
  name,
}: CalendarButtonProps) => {
  const download = () => {
    const ics = buildIcs({ calendar, description, id, location, name });

    if (!ics) {
      return;
    }
    const url = URL.createObjectURL(
      new Blob([ics], { type: 'text/calendar;charset=utf-8' }),
    );
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `${name}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={download} variant="outline" w="full">
      <FiCalendar />
      加入行事曆
    </Button>
  );
};

export default CalendarButton;
