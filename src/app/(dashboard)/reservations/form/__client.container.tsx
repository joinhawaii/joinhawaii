'use client';

import { PAYMENT_STATUS_COLOR, PaymentStatus, PRODUCT_OPTIONS, QUERY_KEYS } from '@/constants';
import { createReservation, deleteReservation, updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type {
  AdditionalOptions,
  ProductType,
  ReservationFormData,
  ReservationResponse
} from '@/types';
import { handleApiError, handleApiSuccess, toReadableAmount } from '@/utils';
import { observable } from '@legendapp/state';
import {
  AlertDialog,
  Badge,
  Button,
  Flex,
  Heading,
  Table,
  Text,
  TextField
} from '@radix-ui/themes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import AdditionalOptionsEditor from './AdditionalOptionsEditor';
import ClientForm from './ClientForm';
import FlightForm from './FlightForm';
import HotelForm from './HotelForm';
import InsuranceForm from './InsuranceForm';
import styles from './page.module.css';
import RentalCarForm from './RentalCarForm';
import TourForm from './TourForm';

const status$ = observable({
  reservationIndex: 0,
  isAdditionalOptionsOpen: false,
  additionalOptionsContext: {} as Partial<{
    id: number;
    type: ProductType;
    title: string;
    data: AdditionalOptions[];
  }>
});

export default function ReservationsFormClientContainer({
  reservation_id
}: {
  reservation_id: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, refetch } = useQuery({
    ...reservationQueryOptions(reservation_id!),
    enabled: !!reservation_id
  });

  useEffect(() => {
    const handleWindowFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [refetch]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'update-content-success') {
        toast.success('진행사항이 업데이트되었습니다.');
        refetch();
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [refetch]);

  const isModify = !!data && !!reservation_id;

  const {
    handleSubmit,
    formState: { isDirty },
    control,
    reset
  } = useForm<ReservationFormData>({
    defaultValues: {
      reservation_fee: data?.reservation_fee || 0,
      deposit: data?.deposit || 0,
      ...(isModify && {
        reservation_id: data?.reservation_id
      })
    }
  });

  const depositValue = useWatch({
    control,
    name: 'deposit'
  });

  const mutation = useMutation({
    mutationFn: (formData: ReservationFormData) => {
      return isModify ? updateReservation(formData) : createReservation(formData);
    },
    onSuccess: (result: { data: ReservationResponse }) => {
      handleApiSuccess(result);
      if (isModify) refetch();
    },
    onError: handleApiError
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteReservation(data!.reservation_id!),
    onSuccess: result => {
      handleApiSuccess(result);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
      router.push('/reservations');
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');
    mutation.mutate(formData, {
      onSuccess: () => reset(formData)
    });
  };

  const handleAdditionalOptions = (context: {
    id: number;
    type: ProductType;
    title: string;
    data: AdditionalOptions[];
  }) => {
    status$.additionalOptionsContext.set(context);
    status$.isAdditionalOptionsOpen.set(true);
  };

  const getProductTotalAmount = (products: Array<{ status: string; total_amount: number }>) => {
    return products.reduce(
      (sum, product) => sum + (product.status !== 'Refunded' ? product.total_amount : 0),
      0
    );
  };

  const getAdditionalOptionsTotalAmount = (
    products: Array<{ status: string; additional_options?: AdditionalOptions[] }>
  ) => {
    return products.reduce(
      (sum, product) =>
        sum +
        (product.status !== 'Refunded'
          ? (product.additional_options ?? []).reduce(
              (optionSum, option) =>
                optionSum + (option.status !== 'Refunded' ? option.total_amount : 0),
              0
            )
          : 0),
      0
    );
  };

  return (
    <div className={styles.root}>
      <Flex mb='4' align='center' justify='between'>
        <Heading as='h2' size='7'>
          예약관리
        </Heading>
        {isModify && (
          <Button size='3' color='red' type='button' onClick={() => setIsDeleteDialogOpen(true)}>
            예약 삭제
          </Button>
        )}
      </Flex>

      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Content maxWidth='450px'>
          <AlertDialog.Title>예약 삭제 확인</AlertDialog.Title>
          <AlertDialog.Description size='2'>
            <strong>[{data?.reservation_id}]</strong> 예약을 삭제하시겠습니까? 등록된 고객,
            항공/호텔/투어/렌터카/보험 정보가 모두 함께 삭제되며 복구할 수 없습니다.
          </AlertDialog.Description>
          <Flex gap='1' mt='4' justify='end'>
            <AlertDialog.Cancel>
              <Button variant='soft' color='gray'>
                취소
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                color='red'
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                삭제
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <Flex direction='column' gap='5'>
        <ClientForm data={data} mutation={mutation} />

        {isModify &&
          PRODUCT_OPTIONS.toSorted((a, b) => {
            const aLen = data?.products[a.table]?.length || 0;
            const bLen = data?.products[b.table]?.length || 0;
            if (aLen && !bLen) return -1;
            if (!aLen && bLen) return 1;
            return 0;
          }).map(opt => {
            const Component = {
              flight: FlightForm,
              hotel: HotelForm,
              tour: TourForm,
              rental_car: RentalCarForm,
              insurance: InsuranceForm
            }[opt.value];
            if (!Component) return null;

            return (
              <Component
                key={opt.value}
                data={data}
                mutation={mutation}
                handleAdditionalOptions={handleAdditionalOptions}
              />
            );
          })}
        {isModify && (
          <Flex justify='end' position='sticky' bottom='2' className={styles['exchange-rate-card']}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex gap='2'>
                <Table.Root variant='surface'>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell
                        align='center'
                        colSpan={
                          PRODUCT_OPTIONS.filter(({ value }) => value !== 'flight').length + 2
                        }
                      >
                        결제사항
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                    <Table.Row>
                      {PRODUCT_OPTIONS.filter(({ value }) => value !== 'flight').map(product => (
                        <Table.ColumnHeaderCell key={product.value} align='center'>
                          {product.label}
                        </Table.ColumnHeaderCell>
                      ))}
                      <Table.ColumnHeaderCell align='center' colSpan={2}>
                        총액
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      {PRODUCT_OPTIONS.filter(({ value }) => value !== 'flight').map(product => (
                        <Table.Cell key={product.value} width='100px'>
                          <Flex justify='center' wrap='nowrap' asChild>
                            <Text size='3'>
                              {toReadableAmount(
                                getProductTotalAmount(data?.products[product.table] ?? []) +
                                  getAdditionalOptionsTotalAmount(
                                    data?.products[product.table] ?? []
                                  )
                              )}
                            </Text>
                          </Flex>
                        </Table.Cell>
                      ))}
                      <Table.Cell width='100px'>
                        <Flex justify='center' wrap='nowrap' asChild>
                          <Text size='3'>{toReadableAmount(Number(data?.total_amount ?? 0))}</Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell width='100px'>
                        <Flex justify='center' wrap='nowrap' asChild>
                          <Text size='3'>
                            {toReadableAmount(Number(data?.total_amount_krw ?? 0), 'ko-KR', 'KRW')}
                          </Text>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>

                <Table.Root variant='surface'>
                  <Table.Body>
                    <Table.Row>
                      <Table.RowHeaderCell>
                        <Text as='label' weight='medium'>
                          예약금
                        </Text>
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <Controller
                          name='reservation_fee'
                          control={control}
                          render={({ field }) => (
                            <TextField.Root
                              size='3'
                              type='number'
                              step='1'
                              inputMode='numeric'
                              value={field.value === 0 ? '' : field.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : +value);
                              }}
                              placeholder='0'
                            >
                              <TextField.Slot>₩</TextField.Slot>
                            </TextField.Root>
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell rowSpan={3} style={{ borderLeft: '1px solid var(--gray-6)' }}>
                        <Badge
                          size='3'
                          color={PAYMENT_STATUS_COLOR[data.payment_status]}
                          variant='soft'
                        >
                          {PaymentStatus[data.payment_status]}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.RowHeaderCell>
                        <Text as='label' weight='medium'>
                          입금액
                        </Text>
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <Controller
                          name='deposit'
                          control={control}
                          rules={{
                            required: true,
                            validate: value => {
                              const numValue = value ? Number(value) : 0;
                              return numValue <= Number(data?.total_amount);
                            }
                          }}
                          render={({ field }) => (
                            <TextField.Root
                              size='3'
                              type='number'
                              step='0.01'
                              max={Number(data?.total_amount || 0)}
                              inputMode='decimal'
                              value={field.value === 0 ? '' : field.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : +value);
                              }}
                              placeholder='0'
                            >
                              <TextField.Slot>$</TextField.Slot>
                            </TextField.Root>
                          )}
                        />
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.RowHeaderCell>
                        <Text as='label' weight='medium'>
                          잔금
                        </Text>
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <TextField.Root
                          readOnly
                          size='3'
                          value={Number(data?.total_amount ?? 0) - (depositValue || 0)}
                        >
                          <TextField.Slot>$</TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={3}>
                        <Flex justify='end' gap='2'>
                          <Button disabled={mutation.isPending} size='3'>
                            저장
                          </Button>
                          <Button
                            variant='outline'
                            size='3'
                            type='button'
                            onClick={() => {
                              if (data?.reservation_id) {
                                window.open(
                                  `/reservations/preview?reservation_id=${encodeURIComponent(data.reservation_id)}`,
                                  '_blank',
                                  'noopener,noreferrer'
                                );
                              }
                            }}
                          >
                            <FileText />
                            예약확인서
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Flex>
            </form>
          </Flex>
        )}
      </Flex>

      <AdditionalOptionsEditor
        isOpen={status$.isAdditionalOptionsOpen}
        context={status$.additionalOptionsContext}
        onRefetch={refetch}
      />
    </div>
  );
}
