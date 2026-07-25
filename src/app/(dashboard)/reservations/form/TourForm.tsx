import { DateTimeInput, GroupSelect, NoData, ProductDeleteButton } from '@/components';
import {
  defaultTourValues,
  PRODUCT_STATUS_COLOR,
  ProductStatus,
  REGIONS,
  TOURS_OPTIONS
} from '@/constants';
import useDeleteProduct from '@/hooks/useDeleteProduct';
import type { ProductFormProps, ProductFormType, ReservationFormData } from '@/types';
import {
  calculateTotalAmount,
  isDev,
  isRefunded,
  normalizeNumber,
  selectOnFocus,
  toReadableAmount
} from '@/utils';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Select,
  Table,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import clsx from 'clsx';
import { Binoculars, Minus, Plus, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  type Control,
  Controller,
  SubmitHandler,
  useForm,
  type UseFormSetValue,
  useWatch
} from 'react-hook-form';
import { toast } from 'react-toastify';
import styles from './page.module.css';
import RefundAlertDialog from './RefundAlertDialog';

export default function TourForm({ data, mutation, handleAdditionalOptions }: ProductFormProps) {
  const searchParams = useSearchParams();
  const reservation_id = searchParams.get('reservation_id')!;

  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty },
    getValues,
    setValue,
    control,
    reset
  } = useForm<ReservationFormData>({
    defaultValues: useMemo(
      () => ({
        reservation_id,
        tours: data.products.tours
      }),
      [reservation_id, data.products.tours]
    )
  });

  useEffect(() => {
    reset({
      reservation_id,
      tours: data.products.tours
    });
  }, [data.products.tours, reservation_id, reset]);

  const tours = useWatch({ control, name: 'tours' }) ?? [defaultTourValues];
  const { openDeleteDialog, DeleteDialog } = useDeleteProduct({
    table: 'tours',
    reservationId: reservation_id,
    getValues,
    setValue
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const normalized: ReservationFormData = {
      ...formData,
      tours: formData.tours.map(tour => ({
        ...tour,
        exchange_rate: normalizeNumber(tour.exchange_rate)
      }))
    };

    mutation.mutate(normalized, {
      onSuccess: result => {
        return reset({
          ...normalized,
          tours: result.data.products.tours
        });
      }
    });
  };

  const addItem = () => {
    setValue('tours', [...tours, defaultTourValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = tours.length <= data.products.tours.length;

  const [refundId, setRefundId] = useState(0);
  const refundItem = tours.find(tour => tour.id === refundId);
  const refundTitle = useMemo(() => {
    const tour = refundItem;
    return tour ? tour.name : '';
  }, [refundItem]);
  const refundAdditionalOptions = refundItem?.additional_options || [];

  const openDialog = (id: number) => setRefundId(id);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card asChild size='3' className={styles['sticky-card']}>
          <Section id='tour'>
            <Box asChild position='sticky' top='0'>
              <Heading as='h3' mb='4'>
                선택관광
              </Heading>
            </Box>

            {!!tours.length && (
              <Table.Root size='1' layout='fixed'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='250px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='240px'>상품명</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='180px'>
                      합계(<Text color='blue'>원가</Text>/판매가)
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='90px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>추가옵션</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='200px'>메모</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>바우처</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                {tours.map((tour, i) => (
                  <Table.Body
                    key={i}
                    id={`tour-${tour.id}`}
                    className={clsx(
                      isRefunded(tour.status, data.products.tours[i]?.status) && 'is-disabled'
                    )}
                  >
                    <Table.Row>
                      <Table.Cell>
                        <Controller
                          name={`tours.${i}.exchange_rate`}
                          control={control}
                          render={({ field }) => (
                            <TextField.Root
                              size='1'
                              variant='soft'
                              color={field.value ? 'indigo' : 'red'}
                              type='number'
                              min='0'
                              step='0.01'
                              value={field.value}
                              onFocus={selectOnFocus}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const { value } = e.target;
                                if (!value) return field.onChange(value);

                                const [integer, decimal] = value.split('.');
                                const formattedValue = decimal
                                  ? `${integer.slice(0, 4)}.${decimal.slice(0, 2)}`
                                  : integer.slice(0, 4);

                                field.onChange(+formattedValue);
                              }}
                            />
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`tours.${i}.region`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              size='1'
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger placeholder='지역 선택'>{field.value}</Select.Trigger>
                              <Select.Content>
                                {REGIONS.map(value => (
                                  <Select.Item value={value} key={value}>
                                    {value}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Flex direction='column' gap='2'>
                          <DateTimeInput name={`tours.${i}.start_date`} control={control} />
                          <DateTimeInput name={`tours.${i}.end_date`} control={control} />
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`tours.${i}.name`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            return <GroupSelect field={field} list={TOURS_OPTIONS} />;
                          }}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span>🧑 성인</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              step='0.01'
                              color='blue'
                              variant='soft'
                              onFocus={selectOnFocus}
                              {...register(`tours.${i}.adult_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>🧒 소아</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              step='0.01'
                              color='blue'
                              variant='soft'
                              onFocus={selectOnFocus}
                              {...register(`tours.${i}.children_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span>👶 유아</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              step='0.01'
                              color='blue'
                              variant='soft'
                              readOnly
                              {...register(`tours.${i}.kids_cost`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span className='invisible'>🧑 성인</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              step='0.01'
                              color='orange'
                              variant='soft'
                              onFocus={selectOnFocus}
                              {...register(`tours.${i}.adult_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span className='invisible'>🧒 소아</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              step='0.01'
                              color='orange'
                              variant='soft'
                              onFocus={selectOnFocus}
                              {...register(`tours.${i}.children_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span className='invisible'>👶 유아</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              step='0.01'
                              color='orange'
                              variant='soft'
                              readOnly
                              {...register(`tours.${i}.kids_price`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Grid gap='2'>
                          <Flex direction='column'>
                            <span className='invisible'>🧑 성인</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              onFocus={selectOnFocus}
                              {...register(`tours.${i}.adult_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span className='invisible'>🧒 소아</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              onFocus={selectOnFocus}
                              {...register(`tours.${i}.children_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                          <Flex direction='column'>
                            <span className='invisible'>👶 유아</span>
                            <TextField.Root
                              size='1'
                              type='number'
                              min='0'
                              onFocus={selectOnFocus}
                              {...register(`tours.${i}.kids_count`, {
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                          </Flex>
                        </Grid>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap='1' align='end'>
                          <Text color='blue' size='3'>
                            {toReadableAmount(getValues(`tours.${i}.total_cost`))}
                          </Text>
                          <span>/</span>
                          <Text weight='bold' size='3'>
                            {toReadableAmount(getValues(`tours.${i}.total_amount`))}
                          </Text>
                        </Flex>
                        <Flex gap='1'>
                          <Text color='blue'>
                            {toReadableAmount(
                              (tour.additional_options || []).reduce(
                                (sum, opt) =>
                                  sum + (opt.status !== 'Refunded' ? opt.total_cost : 0),
                                0
                              )
                            )}
                          </Text>
                          <span>/</span>
                          <Text weight='bold'>
                            {toReadableAmount(
                              (tour.additional_options || []).reduce(
                                (sum, opt) =>
                                  sum + (opt.status !== 'Refunded' ? opt.total_amount : 0),
                                0
                              )
                            )}
                          </Text>
                        </Flex>
                        <Text size='4' weight='bold'>
                          {toReadableAmount(
                            getValues(`tours.${i}.total_amount_krw`),
                            'ko-KR',
                            'KRW'
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`tours.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              size='1'
                              value={field.value}
                              onValueChange={value => {
                                if (
                                  value === 'Refunded' &&
                                  tour.additional_options.length > 0 &&
                                  tour.additional_options
                                    .filter(({ status }) => status !== 'Refunded')
                                    .reduce((accu, curr) => accu + curr.total_amount, 0) > 0
                                ) {
                                  if (tour.id) openDialog(tour.id);
                                  return;
                                }
                                field.onChange(value);
                              }}
                              name={field.name}
                            >
                              <Select.Trigger
                                color={PRODUCT_STATUS_COLOR[field.value]}
                                variant='soft'
                              >
                                {ProductStatus[field.value]}
                              </Select.Trigger>
                              <Select.Content>
                                {Object.entries(ProductStatus).map(([key, label]) => (
                                  <Select.Item key={key} value={key}>
                                    {label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          disabled={!getValues(`tours.${i}.id`)}
                          title='추가옵션'
                          size='1'
                          type='button'
                          onClick={() =>
                            handleAdditionalOptions({
                              id: Number(getValues(`tours.${i}.id`)),
                              type: 'tour',
                              title: getValues(`tours.${i}.name`),
                              data: getValues(`tours.${i}.additional_options`)
                            })
                          }
                        >
                          <Plus size={16} />
                        </Button>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex justify='center' align='center' gap='2'>
                          <Box flexGrow='1'>
                            <TextArea
                              size='3'
                              resize='vertical'
                              style={{ width: '100%' }}
                              {...register(`tours.${i}.notes`, {
                                setValueAs: value =>
                                  typeof value === 'string' ? value.trim() : value
                              })}
                            />
                          </Box>

                          <ProductDeleteButton onClick={() => openDeleteDialog(i)} />
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          disabled={!getValues(`tours.${i}.id`)}
                          size='1'
                          type='button'
                          onClick={() => {
                            const tourId = getValues(`tours.${i}.id`);
                            if (!tourId) return;

                            const query = new URLSearchParams({
                              reservation_id,
                              product_id: String(tourId)
                            });

                            window.open(`/reservations/voucher/tour?${query.toString()}`, '_blank');
                          }}
                        >
                          발급
                        </Button>
                      </Table.Cell>
                      <Table.Cell hidden>
                        <TourTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={12}>
                        <Flex align='center' gap='2'>
                          <Text weight='bold'>비고</Text>
                          <Box flexGrow='1'>
                            <TextField.Root
                              size='1'
                              {...register(`tours.${i}.remarks`, {
                                setValueAs: value =>
                                  typeof value === 'string' ? value.trim() : value
                              })}
                            />
                          </Box>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={12}>
                        <Flex align='center' gap='2'>
                          <Text weight='bold'>규정</Text>
                          <Box flexGrow='1'>
                            <TextField.Root
                              size='1'
                              {...register(`tours.${i}.rule`, {
                                setValueAs: value =>
                                  typeof value === 'string' ? value.trim() : value
                              })}
                            />
                          </Box>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                ))}
              </Table.Root>
            )}

            {!tours.length && <NoData />}

            <Flex justify='end' mt='4' gap='1'>
              <Button type='button' color='ruby' onClick={addItem}>
                <Binoculars size='20' />
                선택관광 추가
              </Button>
              <Button
                type='button'
                color='ruby'
                variant='soft'
                onClick={() => removeItem('tours')}
                disabled={isRemoveDisabled}
              >
                <Minus size='20' /> 삭제
              </Button>
              <Button loading={mutation.isPending || !tours.length} variant='outline'>
                <Save /> 변경사항 저장
              </Button>
            </Flex>

            {DeleteDialog}

            {isDev() && (
              <pre>{isDev() && <pre>{JSON.stringify(watch('tours'), null, 2)}</pre>}</pre>
            )}
          </Section>
        </Card>
      </form>

      <RefundAlertDialog
        open={!!refundId}
        onOpenChange={val => setRefundId(val ? refundId : 0)}
        title={refundTitle}
        onConfirm={() =>
          handleAdditionalOptions({
            id: refundId,
            type: 'tour',
            title: refundTitle,
            data: refundAdditionalOptions
          })
        }
      />
    </>
  );
}

function TourTotalCalculator({
  index,
  setValue,
  control
}: {
  index: number;
  setValue: UseFormSetValue<ReservationFormData>;
  control: Control<ReservationFormData, unknown, ReservationFormData>;
}) {
  const watchedValues = useWatch({
    control,
    name: [
      `tours.${index}.adult_count`,
      `tours.${index}.children_count`,
      `tours.${index}.adult_price`,
      `tours.${index}.children_price`,
      `tours.${index}.adult_cost`,
      `tours.${index}.children_cost`
    ]
  });

  useEffect(() => {
    const [adult_count, children_count, adult_price, children_price, adult_cost, children_cost] =
      watchedValues;
    const { total_amount, total_cost } = calculateTotalAmount({
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    });
    setValue(`tours.${index}.total_amount`, total_amount, { shouldValidate: true });
    setValue(`tours.${index}.total_cost`, total_cost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}
