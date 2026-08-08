'use client';

import { ProductDeleteButton } from '@/components';
import { defaultAdditionalOptionValues, PRODUCT_STATUS_COLOR, ProductStatus } from '@/constants';
import { deleteAdditionalOption, updateAdditionalOptions } from '@/http';
import type { AdditionalOptions, ProductType } from '@/types';
import { handleApiError, handleApiSuccess, isDev } from '@/utils';
import type { Observable, ObservableBoolean } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import {
  AlertDialog,
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Select,
  Table,
  TextArea,
  TextField
} from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Minus, Plus, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import AdditionalOptionsTotals from './AdditionalOptionsTotals';

export default function AdditionalOptionsEditor({
  isOpen: isOpen$,
  context: context$,
  onRefetch
}: {
  isOpen: ObservableBoolean;
  context: Observable<
    Partial<{
      id: number;
      type: ProductType;
      title: string;
      data: AdditionalOptions[];
    }>
  >;
  onRefetch: () => Promise<unknown>;
}) {
  const params = useSearchParams();
  const isOpen = use$(isOpen$);

  const { id = 0, type = 'hotel', title, data } = use$(() => context$);

  const defaultValue = useMemo(
    () => ({
      ...defaultAdditionalOptionValues,
      pid: id,
      type
    }),
    [id, type]
  );

  const {
    watch,
    control,
    setValue,
    register,
    handleSubmit,
    formState: { isDirty },
    reset
  } = useForm<{ additionalOptions: AdditionalOptions[] }>({
    defaultValues: { additionalOptions: [defaultValue] }
  });

  const additionalOptions = useWatch({ control, name: 'additionalOptions' }) ?? [defaultValue];

  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const mutation = useMutation({
    mutationFn: (formData: AdditionalOptions[]) => {
      return updateAdditionalOptions(formData);
    },
    onSuccess: (result: unknown, variables: AdditionalOptions[]) => {
      handleApiSuccess(result);
      reset({ additionalOptions: variables });
      onRefetch();
      isOpen$.set(false);
    },
    onError: handleApiError
  });

  const onSubmit: SubmitHandler<{ additionalOptions: AdditionalOptions[] }> = formData => {
    if (!isDirty) return toast.info('변경된 내용이 없습니다.');

    const optionsWithReservationId = formData.additionalOptions.map(option => ({
      ...option,
      reservation_id: params.get('reservation_id') || ''
    }));

    mutation.mutate(optionsWithReservationId);
  };

  useEffect(() => {
    setValue('additionalOptions', data?.length ? data : [defaultValue]);
  }, [defaultValue, data, setValue]);

  const addAdditionalOption = () => {
    setValue('additionalOptions', [...watch('additionalOptions'), defaultValue]);
  };

  const removeItem = () => {
    setValue('additionalOptions', additionalOptions.slice(0, -1));
  };

  const isRemoveProductDisabled = () => {
    const minLength = 1;
    return additionalOptions.length <= minLength;
  };

  const removeAdditionalOption = (index: number) => {
    const target = additionalOptions[index];
    if (target?.id) {
      setPendingDeleteIndex(index);
      return;
    }

    setValue(
      'additionalOptions',
      additionalOptions.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const confirmRemoveAdditionalOption = async () => {
    const index = pendingDeleteIndex;
    const target = index === null ? undefined : additionalOptions[index];
    if (index === null || !target?.id) {
      setPendingDeleteIndex(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAdditionalOption(target.id);
      toast.success('항목이 삭제되었습니다.');
      setValue(
        'additionalOptions',
        additionalOptions.filter((_, i) => i !== index),
        { shouldDirty: true }
      );
      onRefetch();
    } catch (error) {
      handleApiError(error as Error);
    } finally {
      setIsDeleting(false);
      setPendingDeleteIndex(null);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => isOpen$.set(open)}>
      <Dialog.Content maxWidth='1000px'>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          옵션 구분을 위한 날짜 표시 영역
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Table.Root size='1' layout='fixed'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width='90px'>환율</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='200px'>내용</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💸원가</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='80px'>💰요금</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='70px'>수량</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='90px'>진행상태</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width='200px'>메모</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {additionalOptions.map((_item, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Controller
                      name={`additionalOptions.${i}.exchange_rate`}
                      control={control}
                      render={({ field }) => (
                        <TextField.Root
                          size='1'
                          type='number'
                          min='0'
                          step='0.01'
                          value={field.value}
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
                      {...register(`additionalOptions.${i}.title`, {
                        required: true
                      })}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Grid gap='2'>
                      <Flex direction='column'>
                        <TextField.Root
                          size='1'
                          type='number'
                          min='0'
                          step='0.01'
                          color='blue'
                          variant='soft'
                          {...register(`additionalOptions.${i}.adult_cost`, {
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
                        <TextField.Root
                          size='1'
                          type='number'
                          min='0'
                          step='0.01'
                          color='orange'
                          variant='soft'
                          {...register(`additionalOptions.${i}.adult_price`, {
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
                        <TextField.Root
                          size='1'
                          type='number'
                          min='0'
                          {...register(`additionalOptions.${i}.adult_count`, {
                            required: true,
                            valueAsNumber: true
                          })}
                        />
                      </Flex>
                    </Grid>
                  </Table.Cell>
                  <Table.Cell>
                    <Controller
                      name={`additionalOptions.${i}.status`}
                      control={control}
                      render={({ field }) => (
                        <Select.Root
                          value={field.value}
                          onValueChange={value => {
                            field.onChange(value);
                          }}
                          name={field.name}
                        >
                          <Select.Trigger color={PRODUCT_STATUS_COLOR[field.value]} variant='soft'>
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
                          {...register(`additionalOptions.${i}.notes`)}
                        />
                      </Box>
                      <ProductDeleteButton onClick={() => removeAdditionalOption(i)} />
                    </Flex>
                  </Table.Cell>
                  <Table.Cell hidden>
                    <AdditionalOptionsTotals index={i} setValue={setValue} control={control} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <Flex justify='end' mt='4' gap='1'>
            <Button type='button' color='ruby' onClick={addAdditionalOption}>
              <Plus size='20' />
              상품 추가
            </Button>
            <Button
              type='button'
              color='ruby'
              variant='soft'
              onClick={() => removeItem()}
              disabled={isRemoveProductDisabled()}
            >
              <Minus size='20' /> 삭제
            </Button>
            <Button loading={mutation.isPending} variant='outline'>
              <Save />
              변경사항 저장
            </Button>
          </Flex>
        </form>
        {isDev() && <pre>{JSON.stringify(watch('additionalOptions'), null, 2)}</pre>}
      </Dialog.Content>

      <AlertDialog.Root
        open={pendingDeleteIndex !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteIndex(null);
        }}
      >
        <AlertDialog.Content maxWidth='450px'>
          <AlertDialog.Title>삭제 확인</AlertDialog.Title>
          <AlertDialog.Description size='2'>
            해당 추가 옵션을 삭제하시겠습니까? 삭제한 항목은 복구할 수 없습니다.
          </AlertDialog.Description>
          <Flex gap='1' mt='4' justify='end'>
            <AlertDialog.Cancel>
              <Button variant='soft' color='gray'>
                취소
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                color='ruby'
                loading={isDeleting}
                onClick={e => {
                  e.preventDefault();
                  confirmRemoveAdditionalOption();
                }}
              >
                삭제
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Dialog.Root>
  );
}
