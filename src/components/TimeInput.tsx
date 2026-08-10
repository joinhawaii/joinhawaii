'use client';

import { extractTime, updateTimeInISO } from '@/utils';
import { Flex, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface TimeInputProps<TFieldValues extends FieldValues = FieldValues> {
  name?: FieldPath<TFieldValues>;
  control?: Control<TFieldValues>;
  value?: string | null;
  onValueChange?: (value: string) => void;
}

export function TimeInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  value,
  onValueChange
}: TimeInputProps<TFieldValues>) {
  if (onValueChange) {
    return <TimeInputFields isoValue={value} handleChange={onValueChange} />;
  }

  return (
    <Controller
      name={name as FieldPath<TFieldValues>}
      control={control as Control<TFieldValues>}
      render={({ field }) => (
        <TimeInputFields
          isoValue={field.value as string | null | undefined}
          handleChange={field.onChange}
        />
      )}
    />
  );
}

function TimeInputFields({
  isoValue,
  handleChange
}: {
  isoValue: string | null | undefined;
  handleChange: (value: string) => void;
}) {
  const isDateTimeValue = Boolean(isoValue?.includes('T'));
  const parsedTime = getTimeParts(isoValue);
  const [hoursInput, setHoursInput] = useState(String(parsedTime.hours));
  const [minutesInput, setMinutesInput] = useState(String(parsedTime.minutes));
  const [isHoursFocused, setIsHoursFocused] = useState(false);
  const [isMinutesFocused, setIsMinutesFocused] = useState(false);

  useEffect(() => {
    const next = getTimeParts(isoValue);
    setHoursInput(String(next.hours));
    setMinutesInput(String(next.minutes));
  }, [isoValue]);

  const parseSegment = (raw: string, max: number): number | undefined => {
    if (!/^\d{1,2}$/.test(raw)) return;

    const nextValue = Number(raw);
    if (Number.isNaN(nextValue) || nextValue < 0 || nextValue > max) return;

    return nextValue;
  };

  const applyHours = (raw: string) => {
    if (raw === '') {
      setHoursInput('');
      if (!isDateTimeValue) {
        handleChange('');
      }
      return;
    }

    const parsedHours = parseSegment(raw, 23);
    if (parsedHours === undefined) return;

    setHoursInput(raw);
    const safeMinutes = parsedTime.minutes;

    if (isDateTimeValue) {
      handleChange(updateTimeInISO(isoValue, parsedHours, safeMinutes));
      return;
    }

    handleChange(`${String(parsedHours).padStart(2, '0')}:${String(safeMinutes).padStart(2, '0')}`);
  };

  const applyMinutes = (raw: string) => {
    if (raw === '') {
      setMinutesInput('');
      if (!isDateTimeValue) {
        handleChange('');
      }
      return;
    }

    const parsedMinutes = parseSegment(raw, 59);
    if (parsedMinutes === undefined) return;

    setMinutesInput(raw);
    const safeHours = parsedTime.hours;

    if (isDateTimeValue) {
      handleChange(updateTimeInISO(isoValue, safeHours, parsedMinutes));
      return;
    }

    handleChange(`${String(safeHours).padStart(2, '0')}:${String(parsedMinutes).padStart(2, '0')}`);
  };

  return (
    <Flex gap='1' align='center'>
      <TextField.Root
        size='1'
        type='text'
        value={isHoursFocused ? hoursInput : hoursInput.padStart(2, '0')}
        onChange={e => applyHours(e.target.value)}
        onFocus={() => setIsHoursFocused(true)}
        onBlur={() => {
          setIsHoursFocused(false);
          if (hoursInput === '') {
            setHoursInput(String(parsedTime.hours));
          }
        }}
        style={{ width: 40 }}
        inputMode='numeric'
      />
      :
      <TextField.Root
        size='1'
        type='text'
        value={isMinutesFocused ? minutesInput : minutesInput.padStart(2, '0')}
        onChange={e => applyMinutes(e.target.value)}
        onFocus={() => setIsMinutesFocused(true)}
        onBlur={() => {
          setIsMinutesFocused(false);
          if (minutesInput === '') {
            setMinutesInput(String(parsedTime.minutes));
          }
        }}
        style={{ width: 40 }}
        inputMode='numeric'
      />
    </Flex>
  );
}

function getTimeParts(raw: string | null | undefined): { hours: number; minutes: number } {
  return raw?.includes('T') ? extractTime(raw) : (parsePlainTime(raw) ?? { hours: 0, minutes: 0 });
}

function parsePlainTime(raw: string | null | undefined): { hours: number; minutes: number } | null {
  if (!raw) return null;

  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

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
    return null;
  }

  return { hours, minutes };
}
