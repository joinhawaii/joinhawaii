'use client';

import { Tiptap } from '@/components';
import { updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { ReservationFormData } from '@/types';
import { handleApiError } from '@/utils';
import { Box, Button, Flex, Table, Text } from '@radix-ui/themes';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function ProgressClientContainer({ reservation_id }: { reservation_id: string }) {
  const {
    data: { content, main_client_name }
  } = useSuspenseQuery({
    ...reservationQueryOptions(reservation_id!)
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting }
  } = useForm<{ reservation_id: string; content: string }>({
    defaultValues: { reservation_id, content }
  });

  const mutation = useMutation({
    mutationFn: (formData: Partial<ReservationFormData>) => {
      return updateReservation(formData);
    },
    onSuccess: () => {
      if (window.opener) {
        window.opener.postMessage({ type: 'update-content-success' }, '*');
        setTimeout(() => window.close(), 100);
      }
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<Partial<ReservationFormData>> = async formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    await mutation.mutateAsync({
      ...formData,
      reservation_id
    });
  };

  return (
    <Box p='4'>
      <Box width='250px' mb='2'>
        <Table.Root variant='surface'>
          <Table.Body>
            <Table.Row>
              <Table.Cell width='80px'>
                <Text as='div' weight='medium'>
                  예약 번호
                </Text>
              </Table.Cell>
              <Table.Cell>{reservation_id}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <Text as='div' weight='medium'>
                  예약자
                </Text>
              </Table.Cell>
              <Table.Cell>{main_client_name}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='content'
          control={control}
          rules={{ required: '내용을 입력하세요.' }}
          render={({ field }) => (
            <Tiptap
              value={field.value}
              onChange={value => field.onChange(value)}
              placeholder='진행사항을 입력하세요.'
              height='min-h-[600px]'
              baseFontSize={14}
            />
          )}
        />
        {errors.content && (
          <div style={{ color: 'red', marginTop: 8 }}>{errors.content.message}</div>
        )}
        <Flex justify='end' mt='4'>
          <Button size='3' type='submit' loading={isSubmitting}>
            저장
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
