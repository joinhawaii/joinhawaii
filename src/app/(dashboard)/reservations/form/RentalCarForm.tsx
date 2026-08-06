import {
  CustomSelectInput,
  DateTimeInput,
  NoData,
  ProductDeleteButton,
  TimeInput
} from '@/components';
import {
  CAR_TYPES,
  defaultCarValues,
  PICKUP_LOCATIONS,
  PRODUCT_STATUS_COLOR,
  ProductStatus,
  REGIONS,
  RENTAL_CAR_SPECIAL_OPTIONS
} from '@/constants';
import useDeleteProduct from '@/hooks/useDeleteProduct';
import type { ProductFormProps, ProductFormType, ReservationFormData } from '@/types';
import {
  extractDateString,
  isDev,
  isRefunded,
  normalizeNumber,
  selectOnFocus,
  toReadableAmount,
  updateDateInISO
} from '@/utils';
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Section,
  Select,
  Table,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import clsx from 'clsx';
import { Car, Minus, Plus, Save } from 'lucide-react';
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

export default function RentalCarForm({
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
        rental_cars: data.products.rental_cars
      }),
      [reservation_id, data.products.rental_cars]
    )
  });

  useEffect(() => {
    reset({
      reservation_id,
      rental_cars: data.products.rental_cars
    });
  }, [data.products.rental_cars, reservation_id, reset]);

  const rentalCars = useWatch({ control, name: 'rental_cars' }) ?? [defaultCarValues];
  const { openDeleteDialog, DeleteDialog } = useDeleteProduct({
    table: 'rental_cars',
    reservationId: reservation_id,
    getValues,
    setValue
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const normalized: ReservationFormData = {
      ...formData,
      rental_cars: formData.rental_cars.map(car => ({
        ...car,
        pickup_date: car.pickup_date || null,
        return_date: car.return_date || null,
        exchange_rate: normalizeNumber(car.exchange_rate)
      }))
    };

    mutation.mutate(normalized, {
      onSuccess: result => {
        return reset({
          ...normalized,
          rental_cars: result.data.products.rental_cars
        });
      }
    });
  };

  const addItem = () => {
    setValue('rental_cars', [...rentalCars, defaultCarValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = rentalCars.length <= data.products.rental_cars.length;

  const [refundId, setRefundId] = useState(0);
  const refundItem = rentalCars.find(car => car.id === refundId);
  const refundTitle = useMemo(() => {
    const car = refundItem;
    return car ? car.model : '';
  }, [refundItem]);
  const refundAdditionalOptions = refundItem?.additional_options || [];

  const openDialog = (id: number) => setRefundId(id);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card asChild size='3' className={styles['sticky-card']}>
          <Section id='rental_car'>
            <Box asChild position='sticky' top='0'>
              <Heading as='h3' mb='4'>
                렌터카
              </Heading>
            </Box>

            {!!rentalCars.length && (
              <Table.Root size='1' layout='fixed'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>업체명</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='250px'>픽업</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='250px'>리턴</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='180px'>차종</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='160px'>운전자(영문)</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='180px'>조건</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰1일요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>대여일</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='180px'>
                      합계(<Text color='blue'>원가</Text>/판매가)
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='90px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>추가옵션</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='200px'>메모</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>바우처</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                {rentalCars.map((car, i) => (
                  <Table.Body
                    key={i}
                    id={`rental_car-${car.id}`}
                    className={clsx(
                      isRefunded(car.status, data.products.rental_cars[i]?.status) && 'is-disabled'
                    )}
                  >
                    <Table.Row>
                      <Table.Cell>
                        <Controller
                          name={`rental_cars.${i}.exchange_rate`}
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
                          name={`rental_cars.${i}.region`}
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
                        <Controller
                          name={`rental_cars.${i}.company`}
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
                              <Select.Trigger placeholder='업체명 선택'>
                                {field.value}
                              </Select.Trigger>
                              <Select.Content>
                                {['HERTZ', 'DOLLAR'].map(value => (
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
                        <Flex gap='1' wrap='wrap'>
                          <DateTimeInput name={`rental_cars.${i}.pickup_date`} control={control} />
                          <Controller
                            name={`rental_cars.${i}.pickup_location`}
                            control={control}
                            render={({ field }) => {
                              return (
                                <CustomSelectInput
                                  value={field.value}
                                  options={PICKUP_LOCATIONS}
                                  onChange={field.onChange}
                                  placeholder='픽업장소 선택'
                                />
                              );
                            }}
                          />
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap='1' wrap='wrap'>
                          <Controller
                            name={`rental_cars.${i}.return_date`}
                            control={control}
                            render={({ field }) => {
                              const pickupDate = watch(`rental_cars.${i}.pickup_date`);
                              const dateString = extractDateString(field.value);
                              const minDate = extractDateString(pickupDate);

                              return (
                                <Flex gap='2'>
                                  <TextField.Root
                                    size='1'
                                    {...field}
                                    type='date'
                                    min={minDate}
                                    value={dateString}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value) {
                                        field.onChange(updateDateInISO(field.value, value));
                                      } else {
                                        field.onChange(null);
                                      }
                                    }}
                                    onFocus={() => {
                                      if (!field.value && pickupDate) {
                                        field.onChange(pickupDate);
                                      }
                                    }}
                                  />
                                  <TimeInput
                                    name={`rental_cars.${i}.return_date`}
                                    control={control}
                                  />
                                </Flex>
                              );
                            }}
                          />
                          <Controller
                            name={`rental_cars.${i}.return_location`}
                            control={control}
                            render={({ field }) => {
                              return (
                                <CustomSelectInput
                                  value={field.value}
                                  options={PICKUP_LOCATIONS}
                                  onChange={field.onChange}
                                  placeholder='픽업장소 선택'
                                />
                              );
                            }}
                          />
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`rental_cars.${i}.model`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            return (
                              <CustomSelectInput
                                {...field}
                                options={CAR_TYPES}
                                onChange={field.onChange}
                                placeholder='차종 선택'
                              />
                            );
                          }}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          size='1'
                          placeholder='KANG HEECHANG'
                          {...register(`rental_cars.${i}.driver`, {
                            setValueAs: value => (typeof value === 'string' ? value.trim() : value)
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`rental_cars.${i}.options`}
                          control={control}
                          render={({ field }) => {
                            return (
                              <CustomSelectInput
                                value={field.value}
                                options={RENTAL_CAR_SPECIAL_OPTIONS}
                                onChange={field.onChange}
                                placeholder='선택'
                              />
                            );
                          }}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          size='1'
                          type='number'
                          min='0'
                          step='0.01'
                          color='blue'
                          variant='soft'
                          onFocus={selectOnFocus}
                          {...register(`rental_cars.${i}.cost`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          size='1'
                          type='number'
                          min='0'
                          step='0.01'
                          color='orange'
                          variant='soft'
                          onFocus={selectOnFocus}
                          {...register(`rental_cars.${i}.daily_rate`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          size='1'
                          type='number'
                          min='1'
                          onFocus={selectOnFocus}
                          {...register(`rental_cars.${i}.rental_days`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap='1' align='end'>
                          <Text color='blue' size='3'>
                            {toReadableAmount(getValues(`rental_cars.${i}.total_cost`))}
                          </Text>
                          <span>/</span>
                          <Text weight='bold' size='3'>
                            {toReadableAmount(getValues(`rental_cars.${i}.total_amount`))}
                          </Text>
                        </Flex>
                        <Flex gap='1'>
                          <Text color='blue'>
                            {toReadableAmount(
                              (car.additional_options || []).reduce(
                                (sum, opt) =>
                                  sum + (opt.status !== 'Refunded' ? opt.total_cost : 0),
                                0
                              )
                            )}
                          </Text>
                          <span>/</span>
                          <Text weight='bold'>
                            {toReadableAmount(
                              (car.additional_options || []).reduce(
                                (sum, opt) =>
                                  sum + (opt.status !== 'Refunded' ? opt.total_amount : 0),
                                0
                              )
                            )}
                          </Text>
                        </Flex>
                        <Text size='4' weight='bold'>
                          {toReadableAmount(
                            getValues(`rental_cars.${i}.total_amount_krw`),
                            'ko-KR',
                            'KRW'
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`rental_cars.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              size='1'
                              value={field.value}
                              onValueChange={value => {
                                if (
                                  value === 'Refunded' &&
                                  car.additional_options.length > 0 &&
                                  car.additional_options
                                    .filter(({ status }) => status !== 'Refunded')
                                    .reduce((accu, curr) => accu + curr.total_amount, 0) > 0
                                ) {
                                  if (car.id) openDialog(car.id);
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
                          disabled={!getValues(`rental_cars.${i}.id`)}
                          title='추가옵션'
                          size='1'
                          type='button'
                          onClick={() =>
                            handleAdditionalOptions({
                              id: Number(getValues(`rental_cars.${i}.id`)),
                              type: 'rental_car',
                              title: getValues(`rental_cars.${i}.model`),
                              data: getValues(`rental_cars.${i}.additional_options`)
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
                              {...register(`rental_cars.${i}.notes`, {
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
                          disabled={!getValues(`rental_cars.${i}.id`)}
                          size='1'
                          type='button'
                          onClick={() => {
                            const carId = getValues(`rental_cars.${i}.id`);
                            if (!carId) return;

                            const query = new URLSearchParams({
                              reservation_id,
                              product_id: String(carId)
                            });

                            window.open(`/reservations/voucher/car?${query.toString()}`, '_blank');
                          }}
                        >
                          발급
                        </Button>
                      </Table.Cell>
                      <Table.Cell hidden>
                        <CarTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={16}>
                        <Flex align='center' gap='2'>
                          <Text weight='bold'>비고</Text>
                          <Box flexGrow='1'>
                            <TextField.Root
                              size='1'
                              {...register(`rental_cars.${i}.remarks`, {
                                setValueAs: value =>
                                  typeof value === 'string' ? value.trim() : value
                              })}
                            />
                          </Box>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={16}>
                        <Flex align='center' gap='2'>
                          <Text weight='bold'>규정</Text>
                          <Box flexGrow='1'>
                            <TextField.Root
                              size='1'
                              {...register(`rental_cars.${i}.rule`, {
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

            {!rentalCars.length && <NoData />}

            <Flex justify='end' mt='4' gap='1'>
              <Button type='button' color='ruby' onClick={addItem}>
                <Car size='20' />
                렌터카 추가
              </Button>
              <Button
                type='button'
                color='ruby'
                variant='soft'
                onClick={() => removeItem('rental_cars')}
                disabled={isRemoveDisabled}
              >
                <Minus size='20' /> 삭제
              </Button>
              <Button disabled={!rentalCars.length} loading={mutation.isPending} variant='outline'>
                <Save /> 변경사항 저장
              </Button>
            </Flex>

            {DeleteDialog}

            {isDev() && <pre>{JSON.stringify(watch('rental_cars'), null, 2)}</pre>}
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
            type: 'rental_car',
            title: refundTitle,
            data: refundAdditionalOptions
          })
        }
      />
    </>
  );
}

function CarTotalCalculator({
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
      `rental_cars.${index}.daily_rate`,
      `rental_cars.${index}.rental_days`,
      `rental_cars.${index}.cost`
    ]
  });

  useEffect(() => {
    const [nightly, rentalDays, cost] = watchedValues;
    const total = nightly * rentalDays;
    const totalCost = cost * rentalDays;
    setValue(`rental_cars.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`rental_cars.${index}.total_cost`, totalCost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}
