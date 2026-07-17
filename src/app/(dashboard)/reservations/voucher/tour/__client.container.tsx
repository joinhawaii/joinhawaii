'use client';

import { TimeInput, Tiptap } from '@/components';
import { TOURS_OPTIONS } from '@/constants';
import { updateReservation } from '@/http';
import { reservationQueryOptions } from '@/lib/queries';
import type { ReservationFormData, ReservationResponse } from '@/types';
import {
  formatTimeForPrint,
  toFormTimeValue,
  toParagraphHtml,
  toReadableDate,
  toSqlTime
} from '@/utils';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Heading,
  RadioGroup,
  Section,
  Text,
  TextField
} from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, Mic } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ContactInfoCards } from '../ContactInfoCards';
import {
  buildVoucherPrintFileName,
  getSelectedProductById,
  hasRenderableTiptapContent,
  printWithDocumentTitle,
  type VoucherProductClientContainerProps,
  type VoucherSharedFormState
} from '../shared';
import styles from '../voucher.module.css';

type VoucherFormState = VoucherSharedFormState & {
  voucher_number: string;
  reception: 'PICK UP' | 'CHECK IN';
  arrival_location: string;
  arrival_time: string;
  liability_waiver_url: string;
};

const tourOptions = Object.values(TOURS_OPTIONS).flat();

function getTourOption(name: string) {
  return tourOptions.find(option => option.value === name);
}

function getDefaultArrivalLocation(name: string, arrivalLocation: string | null | undefined) {
  if (hasRenderableTiptapContent(arrivalLocation)) return arrivalLocation ?? '';
  const fallback = getTourOption(name)?.arrival_location;
  return fallback ? toParagraphHtml(fallback) : '';
}

function getDefaultDeliveryNotes(name: string, deliveryNotes: string | null | undefined) {
  if (hasRenderableTiptapContent(deliveryNotes)) return deliveryNotes ?? '';
  const fallback = getTourOption(name)?.delivery_notes;
  return fallback ? toParagraphHtml(fallback) : '';
}

function getDefaultGuideNotes(name: string, guideNotes: string | null | undefined) {
  if (hasRenderableTiptapContent(guideNotes)) return guideNotes ?? '';
  const fallback = getTourOption(name)?.guide_notes;
  return fallback ? toParagraphHtml(fallback) : '';
}

function getDefaultConfirmationNumber(name: string, confirmationNumber: string | null | undefined) {
  if (confirmationNumber) return confirmationNumber;
  return getTourOption(name)?.confirmation_number ?? '';
}

function renderProductNameContent(
  selectedProduct: NonNullable<ReservationResponse['products']['tours'][number]>
) {
  const englishLabel =
    tourOptions?.find(({ label }) => label === selectedProduct.name)?.en_label || '-';

  return (
    <>
      {selectedProduct.name || '-'}
      <Text as='p'>{englishLabel}</Text>
    </>
  );
}

function renderTourDateTimeContent(
  selectedProduct: NonNullable<ReservationResponse['products']['tours'][number]>
) {
  const { start_date, end_date } = selectedProduct;

  if (start_date && end_date) {
    return `${toReadableDate(start_date, true, false)} ~ ${toReadableDate(end_date, true, false)}`;
  }

  if (start_date) {
    return toReadableDate(start_date, true, false);
  }

  return '-';
}

type VoucherTourFormProps = {
  reservationId: string;
  selectedProduct: NonNullable<ReservationResponse['products']['tours'][number]>;
  clients: ReservationResponse['clients'];
};

function VoucherTourForm({ reservationId, selectedProduct, clients }: VoucherTourFormProps) {
  const orderedClientLabels = useMemo(
    () => clients.map(client => `${client.english_name || ''} ${client.gender || ''}`.trim()),
    [clients]
  );

  const voucherMutation = useMutation({
    mutationFn: (payload: Partial<ReservationFormData>) => updateReservation(payload),
    onSuccess: () => {
      toast.success('내용이 저장되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '바우처 저장에 실패했습니다.');
    }
  });

  const defaultFormValues = useMemo<VoucherFormState>(() => {
    const { arrival_time, selected_clients, ...baseFormValues } = selectedProduct;

    const normalizedSelectedClients =
      selected_clients && selected_clients.length > 0 ? selected_clients : orderedClientLabels;

    return {
      ...baseFormValues,
      arrival_time: toFormTimeValue(arrival_time),
      arrival_location: getDefaultArrivalLocation(
        selectedProduct.name,
        selectedProduct.arrival_location
      ),
      delivery_notes: getDefaultDeliveryNotes(selectedProduct.name, selectedProduct.delivery_notes),
      guide_notes: getDefaultGuideNotes(selectedProduct.name, selectedProduct.guide_notes),
      confirmation_number: getDefaultConfirmationNumber(
        selectedProduct.name,
        selectedProduct.confirmation_number
      ),
      selected_clients: normalizedSelectedClients
    };
  }, [orderedClientLabels, selectedProduct]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<VoucherFormState>({
    mode: 'onBlur',
    defaultValues: defaultFormValues
  });
  const selectedReception = watch('reception');
  const arrivalTime = watch('arrival_time');

  const printFileName = useMemo(() => {
    return buildVoucherPrintFileName({
      clients,
      date: selectedProduct.start_date,
      productName: selectedProduct.name,
      productFallback: '투어'
    });
  }, [clients, selectedProduct.name, selectedProduct.start_date]);

  useEffect(() => {
    reset(defaultFormValues);
  }, [defaultFormValues, reset]);

  const onSubmit: SubmitHandler<VoucherFormState> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const { arrival_time, ...tourData } = formData;

    const submitData = {
      reservation_id: reservationId,
      tours: [
        {
          id: selectedProduct.id,
          ...tourData,
          arrival_time: toSqlTime(arrival_time)
        }
      ]
    } as unknown as Partial<ReservationFormData>;

    voucherMutation.mutate(submitData);
  };

  return (
    <Box width='794px' mx='auto' className='voucher-root'>
      <div className='print-watermark' aria-hidden>
        <Image
          src='/images/logo.png'
          alt=''
          width={320}
          height={120}
          className='print-watermark-image'
          priority
        />
      </div>

      <Flex justify='between' align='center' mb='4' className='print:hidden'>
        <Heading as='h2' size='6'>
          바우처 발급
        </Heading>
      </Flex>

      <Section py='0' className={styles.section}>
        <Heading
          as='h2'
          size='7'
          mb='4'
          weight='bold'
          className={`${styles['main-title']} ${styles['main-title-tour']}`}
        >
          tour voucher
        </Heading>
        <table className={styles['info-table']}>
          <colgroup>
            <col width='120px' />
            <col />
            <col width='120px' />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <th className={styles['info-th']}>activity</th>
              <td className={styles['info-td']} colSpan={3}>
                {renderProductNameContent(selectedProduct)}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>voucher</th>
              <td className={styles['info-td']}>
                <Flex direction='column' gap='1' className='print:hidden'>
                  <Controller
                    name='voucher_number'
                    control={control}
                    render={({ field }) => (
                      <TextField.Root
                        {...field}
                        type='text'
                        color={errors.voucher_number ? 'red' : undefined}
                      >
                        <TextField.Slot>#</TextField.Slot>
                      </TextField.Root>
                    )}
                  />
                  {errors.voucher_number && (
                    <Text color='red'>{errors.voucher_number.message}</Text>
                  )}
                </Flex>

                <Text className='print:only'>
                  {watch('voucher_number') ? `#${watch('voucher_number')}` : '-'}
                </Text>
              </td>
              <th className={styles['info-th']}>confirmation</th>
              <td className={styles['info-td']}>
                <Flex direction='column' gap='1' className='print:hidden'>
                  <Controller
                    name='confirmation_number'
                    control={control}
                    render={({ field }) => (
                      <TextField.Root
                        {...field}
                        type='text'
                        color={errors.confirmation_number ? 'red' : undefined}
                      >
                        <TextField.Slot>#</TextField.Slot>
                      </TextField.Root>
                    )}
                  />
                  {errors.confirmation_number && (
                    <Text color='red'>{errors.confirmation_number.message}</Text>
                  )}
                </Flex>

                <Text className='print:only'>
                  {watch('confirmation_number') ? `#${watch('confirmation_number')}` : '-'}
                </Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>date/time</th>
              <td className={styles['info-td']} colSpan={3}>
                {renderTourDateTimeContent(selectedProduct)}
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>location type</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='reception'
                    control={control}
                    render={({ field }) => (
                      <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
                        <Flex gap='5' align='center'>
                          <Flex asChild align='center' gap='1'>
                            <label>
                              <RadioGroup.Item value='PICK UP' />
                              <Text>PICK UP</Text>
                            </label>
                          </Flex>
                          <Flex asChild align='center' gap='1'>
                            <label>
                              <RadioGroup.Item value='CHECK IN' />
                              <Text>CHECK IN</Text>
                            </label>
                          </Flex>
                        </Flex>
                      </RadioGroup.Root>
                    )}
                  />
                </Box>
                <Text className='print:only'>{watch('reception')}</Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>{`${selectedReception} time`}</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <TimeInput
                    value={arrivalTime}
                    onValueChange={value =>
                      setValue('arrival_time', value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      })
                    }
                  />
                </Box>
                <Text className='print:only'>{formatTimeForPrint(watch('arrival_time'))}</Text>
              </td>
            </tr>
            <tr>
              <th className={styles['info-th']}>{`${selectedReception} location`}</th>
              <td className={styles['info-td']} colSpan={3}>
                <Box className='print:hidden'>
                  <Controller
                    name='arrival_location'
                    control={control}
                    render={({ field }) => (
                      <Tiptap
                        value={field.value}
                        onChange={field.onChange}
                        enableImage
                        imageUploadFolder={`reservations/${reservationId}/location`}
                        height='min-h-[220px]'
                        placeholder='위치 안내를 입력하세요. 텍스트와 이미지 첨부가 가능합니다.'
                      />
                    )}
                  />
                </Box>
                <Box
                  className='print:only editor-content'
                  style={{ wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: watch('arrival_location') || '-' }}
                />
              </td>
            </tr>
            {watch('liability_waiver_url') && (
              <tr>
                <th className={styles['info-th']}>면책동의서</th>
                <td className={styles['info-td']} colSpan={3}>
                  <Box className='print:hidden'>
                    <Controller
                      name='liability_waiver_url'
                      control={control}
                      rules={{
                        pattern: {
                          value: /^https?:\/\/\S+$/i,
                          message: '올바른 URL 형식을 입력해주세요.'
                        }
                      }}
                      render={({ field }) => (
                        <TextField.Root
                          {...field}
                          type='url'
                          placeholder='https://example.com/waiver'
                          color={errors.liability_waiver_url ? 'red' : undefined}
                        />
                      )}
                    />
                  </Box>
                  <Text className='print:only' style={{ wordBreak: 'break-all' }}>
                    {watch('liability_waiver_url')}
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Section mt='4' py='0'>
          <Heading as='h3' mb='2' className={styles['sub-title']}>
            guest name
          </Heading>
          <Grid columns='2' className={`${styles['guest-grid']} print:hidden`}>
            <Controller
              name='selected_clients'
              control={control}
              rules={{
                validate: value => value.length > 0 || '인원을 선택해주세요.'
              }}
              render={({ field }) => {
                return (
                  <>
                    {clients.map(client => {
                      const clientLabel =
                        `${client.english_name || ''} ${client.gender || ''}`.trim();
                      const isChecked = field.value.includes(clientLabel);

                      return (
                        <Flex
                          key={client.id}
                          asChild
                          gap='4'
                          align='center'
                          className={styles['guest-row']}
                        >
                          <label>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={checked => {
                                const nextSelectedClients = checked
                                  ? [...field.value, clientLabel]
                                  : field.value.filter(item => item !== clientLabel);

                                field.onChange(
                                  orderedClientLabels.filter(label =>
                                    nextSelectedClients.includes(label)
                                  )
                                );
                              }}
                            />
                            <Text>{client.english_name}</Text>
                            <Text>({client.gender})</Text>
                          </label>
                        </Flex>
                      );
                    })}
                  </>
                );
              }}
            />
          </Grid>
          {errors.selected_clients && (
            <Text color='red' as='p' mt='1'>
              {errors.selected_clients.message}
            </Text>
          )}

          <Grid columns='2' className={`${styles['guest-grid']} print:only`}>
            {watch('selected_clients').map((client, i) => {
              const parts = client.split(' ');
              const gender = parts[parts.length - 1];
              const name = parts.slice(0, -1).join(' ');
              return (
                <Flex key={i} gap='4' align='center' className={styles['guest-row']}>
                  <Text>{i + 1}</Text>
                  <Text>{name}</Text>
                  <Text>{gender}</Text>
                </Flex>
              );
            })}
          </Grid>
        </Section>

        <Box asChild mt='4'>
          <Card>
            <Flex gap='4'>
              <Flex asChild direction='column' align='center' flexShrink='0'>
                <Text size='3' weight='bold'>
                  <Mic />
                  전달
                </Text>
              </Flex>
              <Box flexGrow='1' className='print:hidden'>
                <Controller
                  name='delivery_notes'
                  control={control}
                  render={({ field }) => (
                    <Tiptap
                      value={field.value}
                      onChange={field.onChange}
                      height='min-h-[160px]'
                      placeholder='전달 사항을 입력하세요.'
                    />
                  )}
                />
              </Box>
              <Box className='print:only editor-content'>
                {hasRenderableTiptapContent(watch('delivery_notes')) ? (
                  <div dangerouslySetInnerHTML={{ __html: watch('delivery_notes') }} />
                ) : (
                  <Text>-</Text>
                )}
              </Box>
            </Flex>
          </Card>
        </Box>

        <Box asChild mt='4'>
          <Card>
            <Flex gap='4'>
              <Flex asChild direction='column' align='center' flexShrink='0'>
                <Text size='3' weight='bold'>
                  <Mic />
                  알림
                </Text>
              </Flex>
              <Box flexGrow='1'>
                <Box className='print:hidden'>
                  <Controller
                    name='guide_notes'
                    control={control}
                    render={({ field }) => (
                      <Tiptap
                        value={field.value}
                        onChange={field.onChange}
                        height='min-h-[240px]'
                        placeholder='알림 내용을 입력하세요.'
                      />
                    )}
                  />
                </Box>
                <Box className='print:only editor-content'>
                  {hasRenderableTiptapContent(watch('guide_notes')) ? (
                    <div dangerouslySetInnerHTML={{ __html: watch('guide_notes') }} />
                  ) : (
                    <Text>-</Text>
                  )}
                </Box>
                {selectedProduct.rule && (
                  <Text as='p' color='red' mt='1'>
                    [취소규정] {selectedProduct.rule}
                  </Text>
                )}
              </Box>
            </Flex>
          </Card>
        </Box>

        <ContactInfoCards />

        <Flex justify='center' mt='6' gap='3' className='print:hidden'>
          <Button size='4' onClick={handleSubmit(onSubmit)} loading={voucherMutation.isPending}>
            바우처 저장
          </Button>
          <Button
            size='4'
            color='gray'
            onClick={() => printWithDocumentTitle(printFileName)}
            variant='soft'
          >
            <FileText />
            인쇄 / PDF 다운로드
          </Button>
        </Flex>
      </Section>
    </Box>
  );
}

export default function VoucherTourClientContainer({
  reservationId,
  productId
}: VoucherProductClientContainerProps) {
  const { data, isLoading, isError, error } = useQuery({
    ...reservationQueryOptions(reservationId),
    enabled: !!reservationId
  });

  const selectedProduct = useMemo(
    () => getSelectedProductById(data?.products?.tours ?? [], productId),
    [data, productId]
  );
  if (!reservationId) {
    return (
      <Box width='1000px' mx='auto'>
        <Card>
          <Text>reservation_id가 없어 바우처 정보를 불러올 수 없습니다.</Text>
        </Card>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box width='1000px' mx='auto'>
        <Card>
          <Text>바우처 정보를 불러오는 중...</Text>
        </Card>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box width='1000px' mx='auto'>
        <Card>
          <Text color='red'>
            {error instanceof Error
              ? error.message
              : '바우처 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'}
          </Text>
        </Card>
      </Box>
    );
  }

  if (!selectedProduct) {
    return (
      <Box width='1000px' mx='auto'>
        <Card>
          <Text>선택된 투어 정보를 찾을 수 없습니다.</Text>
        </Card>
      </Box>
    );
  }

  return (
    <VoucherTourForm
      reservationId={reservationId}
      selectedProduct={selectedProduct}
      clients={data?.clients ?? []}
    />
  );
}
