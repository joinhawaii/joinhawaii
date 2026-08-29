import {
  CustomSelectInput,
  GroupSelect,
  NoData,
  ProductDeleteButton,
  ProductOptionBadge
} from '@/components';
import {
  BED_TYPE_LIST,
  defaultHotelValues,
  HOTEL_ROOM_TYPE_LIST,
  HOTELS,
  PRODUCT_STATUS_COLOR,
  ProductStatus,
  REGIONS,
  RESORT_FEE_TYPE_LIST
} from '@/constants';
import useDeleteProduct from '@/hooks/useDeleteProduct';
import type { ProductFormProps, ProductFormType, ReservationFormData } from '@/types';
import {
  isDev,
  isRefunded,
  isVoidedStatus,
  normalizeNumber,
  selectOnFocus,
  toReadableAmount
} from '@/utils';
import {
  Box,
  Button,
  Card,
  Checkbox,
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
import { Hotel, Minus, Plus, Save } from 'lucide-react';
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

export default function HotelForm({ data, mutation, handleAdditionalOptions }: ProductFormProps) {
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
        hotels: data.products.hotels
      }),
      [reservation_id, data.products.hotels]
    )
  });

  useEffect(() => {
    reset(
      {
        reservation_id,
        hotels: data.products.hotels
      },
      { keepDirtyValues: true }
    );
  }, [data.products.hotels, reservation_id, reset]);

  const hotels = useWatch({ control, name: 'hotels' }) ?? [defaultHotelValues];
  const { openDeleteDialog, DeleteDialog } = useDeleteProduct({
    table: 'hotels',
    reservationId: reservation_id,
    getValues,
    setValue
  });

  const onSubmit: SubmitHandler<ReservationFormData> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const normalized: ReservationFormData = {
      ...formData,
      hotels: formData.hotels.map(hotel => ({
        ...hotel,
        check_in_date: hotel.check_in_date || null,
        check_out_date: hotel.check_out_date || null,
        exchange_rate: normalizeNumber(hotel.exchange_rate)
      }))
    };

    mutation.mutate(normalized, {
      onSuccess: result => {
        return reset({
          ...normalized,
          hotels: result.data.products.hotels
        });
      }
    });
  };

  const addItem = () => {
    setValue('hotels', [...hotels, defaultHotelValues]);
  };

  const removeItem = (target: ProductFormType) => {
    const items = getValues(target);
    setValue(target, items.slice(0, -1));
  };

  const isRemoveDisabled = hotels.length <= data.products.hotels.length;

  const [refundId, setRefundId] = useState(0);
  const refundItem = hotels.find(hotel => hotel.id === refundId);
  const refundTitle = useMemo(() => {
    const hotel = refundItem;
    return hotel ? hotel.hotel_name : '';
  }, [refundItem]);
  const refundAdditionalOptions = refundItem?.additional_options || [];

  const openDialog = (id: number) => setRefundId(id);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card asChild size='3' className={styles['sticky-card']}>
          <Section id='hotel'>
            <Box asChild position='sticky' top='0'>
              <Heading as='h3' mb='4'>
                호텔
              </Heading>
            </Box>

            {!!hotels.length && (
              <Table.Root size='1' layout='fixed'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='100px'>지역</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='170px'>날짜</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>숙박일</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='200px'>호텔</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='110px'>객실타입</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>조식</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>리조트피</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='80px'>💰1박요금</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='180px'>
                      합계(<Text color='blue'>원가</Text>/판매가)
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='90px'>진행상태</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='70px'>추가옵션</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='200px'>메모</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width='60px'>바우처</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                {hotels.map((hotel, i) => (
                  <Table.Body
                    key={i}
                    id={`hotel-${hotel.id}`}
                    className={clsx(
                      isRefunded(hotel.status, data.products.hotels[i]?.status) && 'is-disabled'
                    )}
                  >
                    <Table.Row>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.exchange_rate`}
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
                          name={`hotels.${i}.region`}
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
                        <TextField.Root
                          size='1'
                          type='date'
                          {...register(`hotels.${i}.check_in_date`)}
                        />
                        ~
                        <Controller
                          name={`hotels.${i}.check_out_date`}
                          control={control}
                          render={({ field }) => {
                            const checkInDate = watch(`hotels.${i}.check_in_date`);
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
                          onFocus={selectOnFocus}
                          {...register(`hotels.${i}.nights`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.hotel_name`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            return <GroupSelect field={field} list={HOTELS} />;
                          }}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Flex direction='column' gap='1'>
                          <Controller
                            name={`hotels.${i}.room_type`}
                            control={control}
                            render={({ field }) => {
                              return (
                                <CustomSelectInput
                                  value={field.value}
                                  options={HOTEL_ROOM_TYPE_LIST}
                                  onChange={field.onChange}
                                  placeholder={HOTEL_ROOM_TYPE_LIST[0]}
                                />
                              );
                            }}
                          />
                          <Controller
                            name={`hotels.${i}.bed_type`}
                            control={control}
                            render={({ field }) => {
                              return (
                                <CustomSelectInput
                                  value={field.value}
                                  options={BED_TYPE_LIST}
                                  onChange={field.onChange}
                                  placeholder={BED_TYPE_LIST[0]}
                                />
                              );
                            }}
                          />
                          <ProductOptionBadge items={hotel.additional_options} />
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.is_breakfast_included`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              size='1'
                              checked={field.value}
                              onCheckedChange={value => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.resort_fee_type`}
                          control={control}
                          render={({ field }) => {
                            return (
                              <CustomSelectInput
                                value={field.value}
                                options={RESORT_FEE_TYPE_LIST}
                                onChange={field.onChange}
                                placeholder={RESORT_FEE_TYPE_LIST[0].label}
                                allowCustom={false}
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
                          {...register(`hotels.${i}.cost`, {
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
                          {...register(`hotels.${i}.nightly_rate`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap='1' align='end'>
                          <Text color='blue' size='3'>
                            {toReadableAmount(getValues(`hotels.${i}.total_cost`))}
                          </Text>
                          <span>/</span>
                          <Text weight='bold' size='3'>
                            {toReadableAmount(getValues(`hotels.${i}.total_amount`))}
                          </Text>
                        </Flex>
                        <Flex gap='1'>
                          <Text color='blue'>
                            {toReadableAmount(
                              (hotel.additional_options || []).reduce(
                                (sum, opt) =>
                                  sum + (!isVoidedStatus(opt.status) ? opt.total_cost : 0),
                                0
                              )
                            )}
                          </Text>
                          <span>/</span>
                          <Text weight='bold'>
                            {toReadableAmount(
                              (hotel.additional_options || []).reduce(
                                (sum, opt) =>
                                  sum + (!isVoidedStatus(opt.status) ? opt.total_amount : 0),
                                0
                              )
                            )}
                          </Text>
                        </Flex>
                        <Text size='4' weight='bold'>
                          {toReadableAmount(
                            getValues(`hotels.${i}.total_amount_krw`),
                            'ko-KR',
                            'KRW'
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Controller
                          name={`hotels.${i}.status`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              size='1'
                              value={field.value}
                              onValueChange={value => {
                                if (
                                  isVoidedStatus(value) &&
                                  hotel.additional_options.length > 0 &&
                                  hotel.additional_options
                                    .filter(({ status }) => !isVoidedStatus(status))
                                    .reduce((accu, curr) => accu + curr.total_amount, 0) > 0
                                ) {
                                  if (hotel.id) openDialog(hotel.id);
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
                          disabled={!getValues(`hotels.${i}.id`)}
                          title='추가옵션'
                          size='1'
                          type='button'
                          onClick={() =>
                            handleAdditionalOptions({
                              id: Number(getValues(`hotels.${i}.id`)),
                              type: 'hotel',
                              title: getValues(`hotels.${i}.hotel_name`),
                              data: getValues(`hotels.${i}.additional_options`)
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
                              {...register(`hotels.${i}.notes`, {
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
                          disabled={!getValues(`hotels.${i}.id`)}
                          size='1'
                          type='button'
                          onClick={() => {
                            const hotelId = getValues(`hotels.${i}.id`);
                            if (!hotelId) return;

                            const query = new URLSearchParams({
                              reservation_id,
                              product_id: String(hotelId)
                            });

                            window.open(
                              `/reservations/voucher/hotel?${query.toString()}`,
                              '_blank'
                            );
                          }}
                        >
                          발급
                        </Button>
                      </Table.Cell>
                      <Table.Cell hidden>
                        <HotelTotalCalculator index={i} setValue={setValue} control={control} />
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={15}>
                        <Flex align='center' gap='2'>
                          <Text weight='bold'>비고</Text>
                          <Box flexGrow='1'>
                            <TextField.Root
                              size='1'
                              {...register(`hotels.${i}.remarks`, {
                                setValueAs: value =>
                                  typeof value === 'string' ? value.trim() : value
                              })}
                            />
                          </Box>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell colSpan={15}>
                        <Flex align='center' gap='2'>
                          <Text weight='bold'>규정</Text>
                          <Box flexGrow='1'>
                            <TextField.Root
                              size='1'
                              {...register(`hotels.${i}.rule`, {
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

            {!hotels.length && <NoData />}

            <Flex justify='end' mt='4' gap='1'>
              <Button type='button' color='ruby' onClick={addItem}>
                <Hotel size='20' />
                호텔 추가
              </Button>
              <Button
                type='button'
                color='ruby'
                variant='soft'
                onClick={() => removeItem('hotels')}
                disabled={isRemoveDisabled}
              >
                <Minus size='20' /> 삭제
              </Button>
              <Button disabled={!hotels.length} loading={mutation.isPending} variant='outline'>
                <Save /> 변경사항 저장
              </Button>
            </Flex>

            {DeleteDialog}

            {isDev() && <pre>{JSON.stringify(watch('hotels'), null, 2)}</pre>}
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
            type: 'hotel',
            title: refundTitle,
            data: refundAdditionalOptions
          })
        }
      />
    </>
  );
}

function HotelTotalCalculator({
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
    name: [`hotels.${index}.nightly_rate`, `hotels.${index}.nights`, `hotels.${index}.cost`]
  });

  useEffect(() => {
    const [nightly, nights, cost] = watchedValues;
    const total = nightly * nights;
    const totalCost = cost * nights;
    setValue(`hotels.${index}.total_amount`, total, { shouldValidate: true });
    setValue(`hotels.${index}.total_cost`, totalCost, { shouldValidate: true });
  }, [watchedValues, setValue, index]);

  return null;
}
