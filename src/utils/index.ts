import { JOB_FUNCTION, TIME_ZONE } from '@/constants';
import { PaymentStatusKey, ProductStatusKey } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

export function jobTitles(email?: string) {
  if (!email) return '';

  return JOB_FUNCTION[email]?.title || '';
}

export function jobTel(email?: string) {
  if (!email) return '';

  return JOB_FUNCTION[email]?.tel || '';
}

export function getJobInfo(name: string, email: string) {
  return [[name, jobTitles(email)].filter(Boolean).join(' '), jobTel(email)]
    .filter(Boolean)
    .join(' / ');
}

export function toReadableDate(date: Date | string, includeTime = false, hour12 = true) {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '-';

  if (!includeTime) {
    return d.toLocaleDateString('ko-KR', { timeZone: TIME_ZONE });
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12
  }).formatToParts(d);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value || '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');

  const dayPeriod = getPart('dayPeriod').toUpperCase();
  const isMidnight = hour12
    ? hour === '12' && minute === '00' && dayPeriod === 'AM'
    : hour === '00' && minute === '00';

  if (isMidnight) {
    return `${year}-${month}-${day}`;
  }

  return hour12
    ? `${year}-${month}-${day} ${hour}:${minute} ${dayPeriod}`
    : `${year}-${month}-${day} ${hour}:${minute}`;
}

export function toReadableAmount(
  amount = 0,
  locales: Intl.LocalesArgument = 'en-US',
  currency: string = 'USD'
) {
  return amount.toLocaleString(locales, { style: 'currency', currency });
}

export const formatKoreanCurrency = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;
  return isNaN(numValue) ? '' : numValue.toLocaleString('ko-KR');
};

export const parseKoreanCurrency = (value: string) => {
  return parseInt(value.replace(/,/g, '')) || 0;
};

export function isDev() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === 'true';
}

export const statusLabel = (balance: number) => {
  if (balance === 0) return '완불';
  if (balance > 0) return '예약금';
  return '-';
};

export const handleApiSuccess = (data: unknown) => {
  const message =
    typeof data === 'object' && !!data && 'message' in data && typeof data.message === 'string'
      ? data.message
      : '요청에 성공했습니다.';
  toast(message, { type: 'success' });
};

export const handleApiError = (error: Error) => {
  console.error(error);
  toast(error.message, { type: 'error' });
};

export const isPostgrestError = (error: unknown): error is PostgrestError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'details' in error &&
    'hint' in error &&
    'message' in error
  );
};

export function calculateTotalAmount({
  adult_count = 0,
  children_count = 0,
  kids_count = 0,
  adult_price = 0,
  children_price = 0,
  kids_price = 0,
  adult_cost = 0,
  children_cost = 0,
  kids_cost = 0,
  exchange_rate = 0,
  days = 1
}) {
  const total_amount =
    adult_count * adult_price + children_count * children_price + kids_count * kids_price * days;

  const total_cost =
    adult_count * adult_cost + children_count * children_cost + kids_count * kids_cost * days;

  const total_amount_krw = Math.round(total_amount * exchange_rate) || 0;
  const total_cost_krw = Math.round(total_cost * exchange_rate) || 0;

  return {
    total_amount,
    total_cost,
    total_amount_krw,
    total_cost_krw
  };
}

/**
 * 주민등록번호 입력값을 포맷합니다.
 *
 * - 숫자 외 문자를 제거합니다.
 * - 최대 13자리(앞6자리-뒤7자리)까지만 허용합니다.
 * - 6자리 이후에 하이픈('-')을 자동으로 삽입합니다.
 *
 * 예시:
 *   formatResidentId('9001011234567') => '900101-1234567'
 *   formatResidentId('900101') => '900101'
 *   formatResidentId('900101-1234567') => '900101-1234567'
 *
 * @param {string} input - 사용자가 입력한 원시 문자열
 * @returns {string} 하이픈이 적용된 주민등록번호 또는 입력 중인 부분 문자열
 */
export function formatResidentId(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

/**
 * 전화번호를 입력 형식(010-0000-0000)으로 자동 포맷합니다.
 *
 * - 숫자 외 문자를 제거하고 최대 11자리까지 허용합니다.
 * - 모바일(예: 010) 기준으로 3-4-4 포맷을 적용합니다.
 *
 * 예시:
 *   formatPhoneNumber('01012345678') => '010-1234-5678'
 *   formatPhoneNumber('010-1234-5678') => '010-1234-5678'
 *   formatPhoneNumber('01012') => '010-12'
 *
 * @param {string} input - 원시 입력 문자열
 * @returns {string} 포맷된 전화번호 문자열
 */
export function formatPhoneNumber(input: string) {
  const digits = (input ?? '').replace(/\D/g, '').slice(0, 11); // 최대 11자리
  if (!digits) return '';

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/**
 * 입력값을 숫자로 정규화합니다.
 *
 * - '' | undefined | null 은 0으로 처리합니다.
 * - 숫자로 변환 가능한 값은 Number로 변환하여 반환합니다.
 * - 변환 불가(무한대/NaN 등)는 0을 반환합니다.
 *
 * 예:
 *   normalizeNumber('12.34') => 12.34
 *   normalizeNumber('') => 0
 *
 * @param {unknown} v - 정규화할 값
 * @returns {number} 유효한 숫자 또는 0
 */
export function normalizeNumber(v: unknown) {
  if (v === '' || v === undefined || v === null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export const getPaymentStatus = ({
  status,
  paymentStatus
}: {
  status: ProductStatusKey;
  paymentStatus: PaymentStatusKey;
}) => {
  return status === 'Refunded' ? status : paymentStatus;
};

/**
 * ISO 날짜 문자열에서 날짜 부분만 추출합니다 (YYYY-MM-DD)
 * '2026-03-25T15:00:00+00:00' -> '2026-03-25'
 */
export function extractDateString(isoString: string | null | undefined): string {
  if (!isoString) return '';

  return isoString.slice(0, 10);
}

/**
 * ISO 날짜 문자열에서 시간과 분을 추출합니다
 * '2026-03-25T15:00:00+00:00' -> { hours: 15, minutes: 0 }
 */
export function extractTime(isoString: string | null | undefined): {
  hours: number;
  minutes: number;
} {
  if (!isoString) {
    return {
      hours: 0,
      minutes: 0
    };
  }

  const match = isoString.match(/T(\d{2}):(\d{2})(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?$/);
  if (!match) {
    return {
      hours: 0,
      minutes: 0
    };
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return {
      hours: 0,
      minutes: 0
    };
  }

  return {
    hours,
    minutes
  };
}

/**
 * 날짜 문자열을 받아 기존 ISO 문자열의 날짜 부분만 변경합니다
 */
export function updateDateInISO(
  currentISO: string | null | undefined,
  newDateString: string
): string {
  const [, rest = ''] = currentISO?.split('T') ?? [];
  const timezonePart = rest.match(/(Z|[+-]\d{2}:?\d{2})$/)?.[1] ?? '';
  const timePart = rest.replace(/(Z|[+-]\d{2}:?\d{2})$/, '') || '00:00:00';

  return `${newDateString}T${timePart}${timezonePart}`;
}

/**
 * 타임존 오프셋을 ISO 8601 문자열로 반환하는 헬퍼 함수
 */
export function getTimezoneOffsetString(date: Date): string {
  const tzOffsetMin = date.getTimezoneOffset();
  const absOffset = Math.abs(tzOffsetMin);
  const sign = tzOffsetMin > 0 ? '-' : '+';
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const minutes = String(absOffset % 60).padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

/**
 * 시간과 분을 받아 기존 ISO 문자열의 시간 부분만 변경합니다
 */
export function updateTimeInISO(
  currentISO: string | null | undefined,
  hours: number,
  minutes: number
): string {
  const nextTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  const [datePart = '1970-01-01', rest = ''] = currentISO?.split('T') ?? [];
  const timezonePart = rest.match(/(Z|[+-]\d{2}:?\d{2})$/)?.[1] ?? '';

  return `${datePart}T${nextTime}${timezonePart}`;
}

/**
 * 시간 선택 옵션 배열을 생성합니다 (0~23)
 */
export function generateHourOptions(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

/**
 * 분 선택 옵션 배열을 생성합니다 (10분 단위: 0, 10, 20, 30, 40, 50)
 */
export function generateMinuteOptions(interval: number = 10): number[] {
  return Array.from({ length: 60 / interval }, (_, i) => i * interval);
}

export function isRefunded(status: string, originalStatus: string) {
  return status === 'Refunded' && originalStatus === 'Refunded';
}

/**
 * 주어진 객체 배열을 날짜 필드 기준(null 안전)으로 정렬할 때 사용하는 비교 함수 생성기
 *
 * @template T - 비교할 객체 타입
 * @param {keyof T} field - 날짜로 사용할 필드명 (예: 'start_date', 'pickup_date' 등)
 * @returns {(a: T, b: T) => number} - Array.prototype.toSorted 등에 사용할 비교 함수
 *
 * @example
 *   arr.toSorted(compareByDateField('start_date'))
 */
export function compareByDateField<T>(field: keyof T) {
  return (a: T, b: T) =>
    a[field] && b[field]
      ? String(a[field]).localeCompare(String(b[field]))
      : a[field]
        ? -1
        : b[field]
          ? 1
          : 0;
}

export function extractTimeLabel(raw: string | null | undefined) {
  if (!raw) return '';

  const match = raw.match(/(?:T)?(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return '';

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function toFormTimeValue(raw: string, timeStorageDate = '1970-01-01') {
  if (raw.includes('T')) return raw;

  const timeLabel = extractTimeLabel(raw);
  return timeLabel ? `${timeStorageDate}T${timeLabel}:00` : '';
}

export function toSqlTime(raw: string) {
  const timeLabel = extractTimeLabel(raw);
  return timeLabel ? `${timeLabel}:00` : '00:00:00';
}

export function formatTimeForPrint(raw: string | null | undefined) {
  const timeLabel = extractTimeLabel(raw);
  if (!timeLabel) return '-';

  const [hours, minutes] = timeLabel.split(':');
  const hour = Number(hours);
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return `${String(hour12).padStart(2, '0')}:${minutes} ${meridiem}`;
}

export function toParagraphHtml(text: string) {
  const trimmed = text.trim();

  // 이미 HTML 마크업 형태로 저장된 값은 그대로 사용 (다시 <p>로 감싸면 잘못된 중첩이 생김)
  if (/^<[a-z][\s\S]*>$/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split('\n')
    .map(line => `<p>${line}</p>`)
    .join('');
}
