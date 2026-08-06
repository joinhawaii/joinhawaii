import { NoData, ProductDeleteButton } from '@/components';
import { defaultInsuranceValues, PRODUCT_STATUS_COLOR, ProductStatus } from '@/constants';
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
import { BookText, Minus, Save } from 'lucide-react';
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

function calcDays(start?: string | null, end?: string | null) {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '';

  return Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

export default function InsuranceForm({
  data,
  mutation,
  handleAdditionalOptions
}: ProductFormProps) {
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
        insurances: data.products.insurances
      }),
      [reservation_id, data.products.insurances]
    )
  });

  useEffect(() => {
    reset({
      reservation_id,
      insurances: data.products.insurances
    });
  }, [data.products.insurances, reservation_id, reset]);

  const insurances = useWatch({ control, name: 'insurances' }) ?? [defaultInsuranceValues];
  const { openDeleteDialog, DeleteDialog } = useDeleteProduct({
    table: 'insurances',
    reservationId: reservation_id,
    getValues,
    setValue
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const normalized: ReservationFormData = {
      ...formData,
      insurances: formData.insurances.map(insurance => ({
        ...insurance,
        start_date: insurance.start_date || null,
        end_date: insurance.end_date || null,
        exchange_rate: normalizeNumber(insurance.exchange_rate)
      }))
    };

    mutation.mutate(normalized, {
      onSuccess: result => {
        return reset({
          ...normalized,
          insurances: result.data.products.insurances
        });
      }
    });
  };

  const addItem = () => {
    setValue('insurances', [...insurances, defaultInsuranceValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = insurances.length <= data.products.insurances.length;

  const [refundId, setRefundId] = useState(0);
  const refundItem = insurances.find(insurance => insurance.id === refundId);
  const refundTitle = useMemo(() => {
    const insurance = refundItem;
    return insurance ? insurance.company : '';
  }, [refundItem]);
  const refundAdditionalOptions = refundItem?.additional_options || [];

  const openDialog = (id: number) => setRefundId(id);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card asChild size='3' className={styles['sticky-card']}>
          <Section id='insurance'>
            <Box asChild position='sticky' top='0'>
              <Heading as='h3' mb='4'>
                보험사
              </Heading>
            </Box>

            {!!insurances.length && (
              <Table.Root size='1' layout='fixed'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>보험사</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='170px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>여행일수</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='120px'>조건</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='180px'>
                      합계(<Text color='blue'>원가</Text>/판매가)
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='90px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='200px'>메모</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                {insurances.map((insurance, i) => (
                  <Table.Body
                    key={i}
                    id={`insurance-${insurance.id}`}
                    className={clsx(
                      isRefunded(insurance.status, data.products.insurances[i]?.status) &&
                        'is-disabled'
                    )}
                  >
                    <Table.Row>
                      <Table.Cell>
                        <Controller
                          name={`insurances.${i}.exchange_rate`}
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
                        <TextField.Root
                          size='1'
                          {...register(`insurances.${i}.company`, {
                            required: true,
                            setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          size='1'
                          type='date'
                          {...register(`insurances.${i}.start_date`)}
                        />
                        ~
                        <Controller
                          name={`insurances.${i}.end_date`}
                          control={control}
                          render={({ field }) => {
                            const checkInDate = watch(`insurances.${i}.start_date`);
                            return (
                              <TextField.Root
                                size='1'
                                type='date'
                                min={checkInDate || undefined}
                                value={field.value || ''}
                                onChange={field.onChange}
                                onFocus={() => {
                                  if (!field.value && checkInDate) {
                                    field.onChange(checkInDate);
                                  }
                                }}
                              />
                            );
                          }}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          size='1'
                          type='number'
                          min='1'
                          readOnly
                          value={calcDays(
                            getValues(`insurances.${i}.start_date`),
                            getValues(`insurances.${i}.end_date`)
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          size='1'
                          {...register(`insurances.${i}.condition`, {
                            required: true,
                            setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                          })}
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
                              {...register(`insurances.${i}.adult_cost`, {
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
                              {...register(`insurances.${i}.children_cost`, {
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
                              {...register(`insurances.${i}.kids_cost`, {
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
                              {...register(`insurances.${i}.adult_price`, {
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
                              {...register(`insurances.${i}.children_price`, {
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
                              {...register(`insurances.${i}.kids_price`, {
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
                              {...register(`insurances.${i}.adult_count`, {
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
                              {...register(`insurances.${i}.children_count`, {
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
                              {...register(`insurances.${i}.kids_count`, {
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
                            {toReadableAmount(getValues(`insurances.${i}.total_cost`))}
                          </Text>
                          <span>/</span>
                          <Text weight='bold' size='3'>
                            {toReadableAmount(getValues(`insurances.${i}.total_amount`))}
                          </Text>
                        </Flex>{' '}
                        <Flex gap='1'>
                          <Text color='blue'>
                            {toReadableAmount(
                              (insurance.additional_options || []).reduce(
                                (sum, opt) =>
                                  sum + (opt.status !== 'Refunded' ? opt.total_cost : 0),
                                0
                              )
                            )}
                          </Text>
                          <span>/</span>
                          <Text weight='bold'>
                            {toReadableAmount(
                              (insurance.additional_options || []).reduce(
                                (sum, opt) =>
                                  sum + (opt.status !== 'Refunded' ? opt.total_amount : 0),
                                0
                              )
                            )}
                          </Text>
                        </Flex>
                        <Text size='4' weight='bold'>
                          {toReadableAmount(
                            getValues(`insurances.${i}.total_amount_krw`),
                            'ko-KR',
                            'KRW'
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`insurances.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              size='1'
                              value={field.value}
                              onValueChange={value => {
                                if (
                                  value === 'Refunded' &&
                                  insurance.additional_options.length > 0 &&
                                  insurance.additional_options
                                    .filter(({ status }) => status !== 'Refunded')
                                    .reduce((accu, curr) => accu + curr.total_amount, 0) > 0
                                ) {
                                  if (insurance.id) openDialog(insurance.id);
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
                        <Flex justify='center' align='center' gap='2'>
                          <Box flexGrow='1'>
                            <TextArea
                              size='3'
                              resize='vertical'
                              style={{ width: '100%' }}
                              {...register(`insurances.${i}.notes`, {
                                setValueAs: value =>
                                  typeof value === 'string' ? value.trim() : value
                              })}
                            />
                          </Box>
                          <ProductDeleteButton onClick={() => openDeleteDialog(i)} />
                        </Flex>
                      </Table.Cell>
                      <Table.Cell hidden>
                        <InsuranceTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={11}>
                        <Flex align='center' gap='2'>
                          <Text weight='bold'>비고</Text>
                          <Box flexGrow='1'>
                            <TextField.Root
                              size='1'
                              {...register(`insurances.${i}.remarks`, {
                                setValueAs: value =>
                                  typeof value === 'string' ? value.trim() : value
                              })}
                            />
                          </Box>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={11}>
                        <Flex align='center' gap='2'>
                          <Text weight='bold'>규정</Text>
                          <Box flexGrow='1'>
                            <TextField.Root
                              size='1'
                              {...register(`insurances.${i}.rule`, {
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

            {!insurances.length && <NoData />}

            <Flex justify='end' mt='4' gap='1'>
              <Button type='button' color='ruby' onClick={addItem}>
                <BookText size='20' />
                보험 추가
              </Button>
              <Button
                type='button'
                color='ruby'
                variant='soft'
                onClick={() => removeItem('insurances')}
                disabled={isRemoveDisabled}
              >
                <Minus size='20' /> 삭제
              </Button>
              <Button disabled={!insurances.length} loading={mutation.isPending} variant='outline'>
                <Save /> 변경사항 저장
              </Button>
            </Flex>

            {DeleteDialog}

            {isDev() && <pre>{JSON.stringify(watch('insurances'), null, 2)}</pre>}
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
            type: 'insurance',
            title: refundTitle,
            data: refundAdditionalOptions
          })
        }
      />
    </>
  );
}

function InsuranceTotalCalculator({
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
      `insurances.${index}.days`,
      `insurances.${index}.adult_count`,
      `insurances.${index}.children_count`,
      `insurances.${index}.adult_price`,
      `insurances.${index}.children_price`,
      `insurances.${index}.adult_cost`,
      `insurances.${index}.children_cost`
    ]
  });

  useEffect(() => {
    const [
      days,
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    ] = watchedValues;
    const { total_amount, total_cost } = calculateTotalAmount({
      days,
      adult_count,
      children_count,
      adult_price,
      children_price,
      adult_cost,
      children_cost
    });
    setValue(`insurances.${index}.total_amount`, total_amount, { shouldValidate: true });
    setValue(`insurances.${index}.total_cost`, total_cost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}
