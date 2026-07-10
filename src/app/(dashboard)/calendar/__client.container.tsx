'use client';

import { calendarQueryOptions } from '@/lib/queries';
import type { ReservationResponse } from '@/types';
import { Heading } from '@radix-ui/themes';
import { useSuspenseQuery } from '@tanstack/react-query';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import styles from './calendar.module.css';

const locales = { ko };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const calendarFormats = {
  monthHeaderFormat: 'yyyy년 M월',
  weekdayFormat: 'cccc',
  dayFormat: 'M월 d일 (ccc)',
  dayHeaderFormat: 'yyyy년 M월 d일 (cccc)',
  dateFormat: 'd',
  agendaDateFormat: 'M월 d일 (ccc)',
  dayRangeHeaderFormat: (
    { start, end }: { start: Date; end: Date },
    culture?: string,
    localizer?: { format: (date: Date, str: string, culture?: string) => string }
  ) =>
    localizer
      ? `${localizer.format(start, 'yyyy년 M월 d일', culture)} - ${localizer.format(end, 'M월 d일', culture)}`
      : '',
  agendaHeaderFormat: (
    { start, end }: { start: Date; end: Date },
    culture?: string,
    localizer?: { format: (date: Date, str: string, culture?: string) => string }
  ) =>
    localizer
      ? `${localizer.format(start, 'yyyy년 M월 d일', culture)} - ${localizer.format(end, 'M월 d일', culture)}`
      : ''
};

const messages = {
  allDay: '종일',
  previous: '이전',
  next: '다음',
  today: '오늘',
  month: '월간',
  week: '주간',
  day: '일간',
  agenda: '일정',
  date: '날짜',
  time: '시간',
  event: '일정',
  noEventsInRange: '해당 기간에 일정이 없습니다.',
  showMore: (total: number) => `+${total}개 더 보기`
};

type CalendarEventType = 'flight' | 'hotel' | 'tour' | 'rental_car';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: {
    type: CalendarEventType;
    productId: number;
    reservationId: string;
    productName: string;
    clientLabel: string;
  };
}

const TYPE_CONFIG: Record<CalendarEventType, { label: string; color: string }> = {
  flight: { label: '항공', color: 'var(--green-8)' },
  hotel: { label: '호텔', color: 'var(--blue-9)' },
  tour: { label: '선택관광', color: 'var(--red-9)' },
  rental_car: { label: '렌터카', color: 'var(--lime-8)' }
};

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function buildClientLabel(res: ReservationResponse): string {
  const validClients = res.clients.filter(({ status }) => status !== 'Cancelled');

  if (validClients.length > 2) {
    return `${res.main_client_name} 외 ${validClients.length - 1}명`;
  }
  return validClients.join(', ');
}

function toCalendarEvents(reservations: ReservationResponse[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const res of reservations) {
    const clientLabel = buildClientLabel(res);
    const reservationId = res.reservation_id ?? String(res.id);

    for (const flight of res.products.flights) {
      if (!flight.departure_datetime) continue;
      const start = new Date(flight.departure_datetime);
      const end = flight.arrival_datetime ? new Date(flight.arrival_datetime) : start;
      events.push({
        id: `flight-${flight.id}`,
        title: flight.flight_number,
        start,
        end,
        resource: {
          type: 'flight',
          productId: flight.id,
          reservationId,
          productName: flight.flight_number,
          clientLabel
        }
      });
    }

    for (const hotel of res.products.hotels) {
      if (!hotel.check_in_date) continue;
      const start = parseLocalDate(hotel.check_in_date);
      const end = hotel.check_out_date ? parseLocalDate(hotel.check_out_date) : start;
      events.push({
        id: `hotel-${hotel.id}`,
        title: hotel.hotel_name,
        start,
        end,
        allDay: true,
        resource: {
          type: 'hotel',
          productId: hotel.id,
          reservationId,
          productName: hotel.hotel_name,
          clientLabel
        }
      });
    }

    for (const tour of res.products.tours) {
      if (!tour.start_date) continue;
      const start = parseLocalDate(tour.start_date);
      const end = tour.end_date ? parseLocalDate(tour.end_date) : start;
      events.push({
        id: `tour-${tour.id}`,
        title: tour.name,
        start,
        end,
        allDay: true,
        resource: {
          type: 'tour',
          productId: tour.id,
          reservationId,
          productName: tour.name,
          clientLabel
        }
      });
    }

    for (const car of res.products.rental_cars) {
      if (!car.pickup_date) continue;
      const start = parseLocalDate(car.pickup_date);
      const end = car.return_date ? parseLocalDate(car.return_date) : start;
      events.push({
        id: `car-${car.id}`,
        title: car.model,
        start,
        end,
        allDay: true,
        resource: {
          type: 'rental_car',
          productId: car.id,
          reservationId,
          productName: car.model,
          clientLabel
        }
      });
    }
  }

  return events;
}

function CustomEvent({ event }: { event: CalendarEvent }) {
  return (
    <div className={styles.eventContent}>
      <span className={styles.eventName}>{event.resource.productName}</span>
      <span className={styles.eventClient}>{event.resource.clientLabel}</span>
    </div>
  );
}

export default function CalendarClientContainer() {
  const router = useRouter();
  const { data: reservations } = useSuspenseQuery(calendarQueryOptions());
  const events = toCalendarEvents(reservations);

  const eventPropGetter = (event: CalendarEvent) => ({
    style: { backgroundColor: TYPE_CONFIG[event.resource.type].color, border: 'none' }
  });

  const handleSelectEvent = (event: CalendarEvent) => {
    const { reservationId, type, productId } = event.resource;
    router.push(`/reservations/form?reservation_id=${reservationId}#${type}-${productId}`);
  };

  return (
    <div>
      <Heading as='h2' mb='4' size='7'>
        일정확인
      </Heading>
      <div className={styles.root}>
        <div className={styles.legend}>
          {(
            Object.entries(TYPE_CONFIG) as [CalendarEventType, { label: string; color: string }][]
          ).map(([type, { label, color }]) => (
            <div key={type} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className={styles.calendarWrapper}>
          <Calendar<CalendarEvent>
            localizer={localizer}
            events={events}
            culture='ko'
            messages={messages}
            formats={calendarFormats}
            startAccessor={e => e.start}
            endAccessor={e => e.end}
            eventPropGetter={eventPropGetter}
            onSelectEvent={handleSelectEvent}
            components={{ event: CustomEvent }}
            style={{ height: 'calc(100vh - 240px)' }}
            popup
          />
        </div>
      </div>
    </div>
  );
}
