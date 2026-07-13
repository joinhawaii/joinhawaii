import { getAdditionalOptions } from '@/http';
import { getReservation, updateReservationProducts } from '@/lib/supabase/queries/reservation';
import { RESERVATION_SELECT_QUERY } from '@/lib/supabase/schema';
import { createClient } from '@/lib/supabase/server';
import type {
  PaymentStatusKey,
  ProductType,
  ProductValues,
  ReservationQueryResponse,
  ReservationRequest,
  ReservationRow,
  ReservationUpdateRequest,
  TablesInsert
} from '@/types';
import { compareByDateField, isPostgrestError } from '@/utils';
import { NextResponse } from 'next/server';

const toComparableId = (id: unknown) => {
  const numericId = Number(id);
  return Number.isFinite(numericId) ? numericId : Number.MAX_SAFE_INTEGER;
};

const compareByDateFieldThenId = <T extends { id?: unknown }>(field: keyof T) => {
  const compareDate = compareByDateField<T>(field);

  return (a: T, b: T) => {
    const dateResult = compareDate(a, b);
    if (dateResult !== 0) return dateResult;

    return toComparableId(a.id) - toComparableId(b.id);
  };
};

const compareByCreatedAtThenId = <T extends { created_at?: string | null; id?: unknown }>() => {
  return (a: T, b: T) => {
    const createdAtDiff =
      new Date(a.created_at ?? '').getTime() - new Date(b.created_at ?? '').getTime();

    if (createdAtDiff !== 0) return createdAtDiff;

    return toComparableId(a.id) - toComparableId(b.id);
  };
};

type ReservationWritePayload = Pick<
  ReservationRequest,
  | 'main_client_name'
  | 'booking_platform'
  | 'reservation_fee'
  | 'deposit'
  | 'trip_type'
  | 'travel_category'
  | 'start_date'
  | 'end_date'
  | 'nights'
  | 'days'
  | 'content'
>;

const reservationStringKeys = [
  'main_client_name',
  'booking_platform',
  'trip_type',
  'travel_category',
  'content'
] satisfies Array<keyof ReservationWritePayload>;

const reservationNullableDateKeys = ['start_date', 'end_date'] satisfies Array<
  keyof ReservationWritePayload
>;

const reservationNumericKeys = ['reservation_fee', 'deposit', 'nights', 'days'] satisfies Array<
  keyof ReservationWritePayload
>;

const getReservationWritePayload = (payload: Record<string, unknown>) => {
  const writePayload: Partial<ReservationWritePayload> = {};

  reservationStringKeys.forEach(key => {
    if (key in payload) {
      writePayload[key] = payload[key] as ReservationWritePayload[typeof key];
    }
  });

  reservationNullableDateKeys.forEach(key => {
    if (key in payload) {
      writePayload[key] = ((payload[key] as string | null) ||
        null) as ReservationWritePayload[typeof key];
    }
  });

  reservationNumericKeys.forEach(key => {
    if (key in payload) {
      writePayload[key] = Number(payload[key] ?? 0) as ReservationWritePayload[typeof key];
    }
  });

  return writePayload;
};

export async function POST(request: Request) {
  try {
    const {
      clients,
      flights: _flights,
      hotels: _hotels,
      tours: _tours,
      rental_cars: _rental_cars,
      insurances: _insurances,
      ...reservationData
    }: ReservationRequest = await request.json();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const supabase = await createClient();

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
    if (userError) {
      console.error('유저 정보 조회 실패:', userError);
      throw userError;
    }

    const { data: lastReservation } = await supabase
      .from('reservations')
      .select('reservation_id')
      .like('reservation_id', `${today}-%`)
      .order('reservation_id', { ascending: false })
      .limit(1)
      .single<Pick<ReservationRow, 'reservation_id'>>();

    const sequence = lastReservation?.reservation_id
      ? parseInt(lastReservation.reservation_id.match(/-JH(\d{3})$/)?.[1] ?? '0', 10) + 1
      : 1;

    const reservationId = `${today}-JH${String(sequence).padStart(3, '0')}`;

    const normalized = getReservationWritePayload(reservationData as Record<string, unknown>);

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...normalized,
        reservation_id: reservationId,
        author: user?.user_metadata?.full_name || '-',
        author_email: user?.email || '-'
      } as TablesInsert<'reservations'>)
      .select()
      .maybeSingle();

    const clientsPayload = clients.map(client => ({ ...client, reservation_id: reservationId }));

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert(clientsPayload)
      .select();

    if (error) {
      console.error('예약 생성 실패:', error);
      throw error;
    }

    if (!data) {
      throw new Error('예약 등록 후 데이터를 가져올 수 없습니다.');
    }

    if (clientError) {
      console.error('Clients 생성 실패:', error);
      throw clientError;
    }

    return NextResponse.json({
      message: `[${data.reservation_id}] 예약이 등록되었습니다`,
      success: true,
      data: {
        ...data,
        clients: clientData?.toSorted(compareByCreatedAtThenId()) ?? []
      }
    });
  } catch (error) {
    console.error('예약 생성 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '예약 생성 실패',
        details: error
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');
    const supabase = await createClient();

    if (reservationId) {
      const reservation = await getReservation(supabase, reservationId);

      if (!reservation) {
        return NextResponse.json({ success: true, data: null });
      }

      const { flights, hotels, tours, rental_cars, insurances, ...rest } = reservation;

      const addKoreanWonFields = async (products: ProductValues[]) => {
        return Promise.all(
          products.map(async product => {
            const options = await getAdditionalOptions({
              pid: Number(product.id),
              type: product.type
            });

            const optionsWithKrw = options.map(opt => ({
              ...opt,
              total_amount_krw: Math.round(opt.total_amount * opt.exchange_rate),
              total_cost_krw: Math.round(opt.total_cost * opt.exchange_rate)
            }));

            const optionsTotals = optionsWithKrw.reduce(
              (acc, o) => ({
                total_amount_krw:
                  acc.total_amount_krw + (o.status !== 'Refunded' ? o.total_amount_krw : 0),
                total_cost_krw:
                  acc.total_cost_krw + (o.status !== 'Refunded' ? o.total_cost_krw : 0)
              }),
              { total_amount_krw: 0, total_cost_krw: 0 }
            );

            return {
              ...product,
              additional_options: optionsWithKrw,
              total_amount_krw:
                Math.round(product.total_amount * product.exchange_rate) +
                optionsTotals.total_amount_krw,
              total_cost_krw:
                Math.round(product.total_cost * product.exchange_rate) +
                optionsTotals.total_cost_krw
            };
          })
        );
      };

      const [flightsWithKrw, hotelsWithKrw, toursWithKrw, carsWithKrw, insurancesWithKrw] =
        await Promise.all([
          addKoreanWonFields(
            flights
              .map(item => ({ ...item, type: 'flight' as ProductType }))
              .toSorted(compareByCreatedAtThenId())
          ),
          addKoreanWonFields(
            hotels
              .map(item => ({ ...item, type: 'hotel' as ProductType }))
              .toSorted(compareByDateFieldThenId('check_in_date'))
          ),
          addKoreanWonFields(
            tours
              .map(item => ({ ...item, type: 'tour' as ProductType }))
              .toSorted(compareByDateFieldThenId('start_date'))
          ),
          addKoreanWonFields(
            rental_cars
              .map(item => ({ ...item, type: 'rental_car' as ProductType }))
              .toSorted(compareByDateFieldThenId('pickup_date'))
          ),
          addKoreanWonFields(
            insurances
              .map(item => ({ ...item, type: 'insurance' as ProductType }))
              .toSorted(compareByDateFieldThenId('start_date'))
          )
        ]);

      const calculateTotal = (products: ProductValues[]) => {
        return products.reduce(
          (acc, product) => ({
            total_amount_krw:
              acc.total_amount_krw + (product.status !== 'Refunded' ? product.total_amount_krw : 0),
            total_cost_krw:
              acc.total_cost_krw + (product.status !== 'Refunded' ? product.total_cost_krw : 0)
          }),
          { total_amount_krw: 0, total_cost_krw: 0 }
        );
      };

      const flightTotals = calculateTotal(flightsWithKrw);
      const hotelTotals = calculateTotal(hotelsWithKrw);
      const tourTotals = calculateTotal(toursWithKrw);
      const carTotals = calculateTotal(carsWithKrw);
      const insuranceTotals = calculateTotal(insurancesWithKrw);

      const total_amount_krw =
        flightTotals.total_amount_krw +
        hotelTotals.total_amount_krw +
        tourTotals.total_amount_krw +
        carTotals.total_amount_krw +
        insuranceTotals.total_amount_krw;

      const total_cost_krw =
        flightTotals.total_cost_krw +
        hotelTotals.total_cost_krw +
        tourTotals.total_cost_krw +
        carTotals.total_cost_krw +
        insuranceTotals.total_cost_krw;

      const sumProductsOriginal = (products: ProductValues[]) =>
        products
          .filter(({ status }) => status !== 'Refunded')
          .reduce((acc, product) => acc + product.total_amount, 0);

      const productsOriginalTotal =
        sumProductsOriginal(flightsWithKrw) +
        sumProductsOriginal(hotelsWithKrw) +
        sumProductsOriginal(toursWithKrw) +
        sumProductsOriginal(carsWithKrw) +
        sumProductsOriginal(insurancesWithKrw);

      const sumOptionsOriginal = (products: ProductValues[]) =>
        products.reduce((acc, product) => {
          const opts = product.additional_options;
          return (
            acc +
            opts
              .filter(({ status }) => status !== 'Refunded')
              .reduce((s, opt) => s + opt.total_amount, 0)
          );
        }, 0);

      const additionalOptionsTotalOriginal =
        sumOptionsOriginal(flightsWithKrw) +
        sumOptionsOriginal(hotelsWithKrw) +
        sumOptionsOriginal(toursWithKrw) +
        sumOptionsOriginal(carsWithKrw) +
        sumOptionsOriginal(insurancesWithKrw);

      const totalAmountOriginal = productsOriginalTotal + additionalOptionsTotalOriginal;

      const paymentStatus = (): PaymentStatusKey => {
        if (!(rest.total_amount - rest.deposit)) return 'Full';
        if (!rest.reservation_fee) return 'Unpaid';
        if (rest.reservation_fee > 0) return 'Deposit';
        return 'Unpaid';
      };

      return NextResponse.json({
        success: true,
        data: {
          ...rest,
          products: {
            flights: flightsWithKrw,
            hotels: hotelsWithKrw,
            tours: toursWithKrw,
            rental_cars: carsWithKrw,
            insurances: insurancesWithKrw
          },
          payment_status: paymentStatus(),
          total_amount: totalAmountOriginal,
          total_amount_krw,
          total_cost_krw
        }
      });
    }

    const { data, error } = await supabase
      .from('reservations')
      .select<string, ReservationQueryResponse>(RESERVATION_SELECT_QUERY)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedData =
      data?.map(({ flights, hotels, tours, rental_cars, insurances, ...rest }) => {
        const allProducts = [
          ...flights,
          ...hotels,
          ...tours,
          ...rental_cars,
          ...(insurances || [])
        ];

        const total_amount_krw = Math.round(
          allProducts.reduce(
            (sum, product) => sum + product.total_amount * product.exchange_rate,
            0
          )
        );

        const total_cost_krw = Math.round(
          allProducts.reduce((sum, product) => sum + product.total_cost * product.exchange_rate, 0)
        );

        return {
          ...rest,
          products: { flights, hotels, tours, rental_cars, insurances },
          total_amount_krw,
          total_cost_krw
        };
      }) ?? [];

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Reservation fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reservations'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const {
      reservation_id,
      exchange_rate,
      clients,
      flights,
      hotels,
      tours,
      rental_cars,
      insurances,
      ...updates
    } = (await request.json()) as ReservationUpdateRequest;

    if (!reservation_id) {
      throw new Error('예약번호는 필수입니다.');
    }

    const supabase = await createClient();

    await updateReservationProducts(supabase, reservation_id, {
      clients,
      flights,
      hotels,
      tours,
      rental_cars,
      insurances
    });

    const { data: totals } = await supabase.rpc('calculate_reservation_total', {
      p_reservation_id: reservation_id
    });

    const reservationUpdates = getReservationWritePayload(updates as Record<string, unknown>);

    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update({
        ...(totals ?? {}),
        ...reservationUpdates
      } as Partial<ReservationRow>)
      .eq('reservation_id', reservation_id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedReservation) throw new Error('예약 정보를 찾을 수 없습니다.');

    const reservation = await getReservation(supabase, reservation_id);

    if (!reservation) {
      return NextResponse.json({ success: true, data: null });
    }

    const {
      flights: flightsData,
      hotels: hotelsData,
      tours: toursData,
      rental_cars: rentalCarsData,
      insurances: insurancesData,
      ..._restData
    } = reservation;

    const addKoreanWonFields = async (products: ProductValues[]) => {
      return Promise.all(
        products.map(async product => {
          const options = await getAdditionalOptions({
            pid: Number(product.id),
            type: product.type
          });

          const optionsWithKrw = options.map(opt => ({
            ...opt,
            total_amount_krw: Math.round(opt.total_amount * opt.exchange_rate),
            total_cost_krw: Math.round(opt.total_cost * opt.exchange_rate)
          }));

          return {
            ...product,
            additional_options: optionsWithKrw
          };
        })
      );
    };

    const [flightsWithKrw, hotelsWithKrw, toursWithKrw, carsWithKrw, insurancesWithKrw] =
      await Promise.all([
        addKoreanWonFields(
          flightsData
            .map(item => ({ ...item, type: 'flight' as ProductType }))
            .toSorted(compareByCreatedAtThenId())
        ),
        addKoreanWonFields(
          hotelsData
            .map(item => ({ ...item, type: 'hotel' as ProductType }))
            .toSorted(compareByDateFieldThenId('check_in_date'))
        ),
        addKoreanWonFields(
          toursData
            .map(item => ({ ...item, type: 'tour' as ProductType }))
            .toSorted(compareByDateFieldThenId('start_date'))
        ),
        addKoreanWonFields(
          rentalCarsData
            .map(item => ({ ...item, type: 'rental_car' as ProductType }))
            .toSorted(compareByDateFieldThenId('pickup_date'))
        ),
        addKoreanWonFields(
          insurancesData
            .map(item => ({ ...item, type: 'insurance' as ProductType }))
            .toSorted(compareByDateFieldThenId('start_date'))
        )
      ]);

    return NextResponse.json({
      message: `[${reservation_id}] 예약 내용이 변경되었습니다`,
      success: true,
      data: {
        ...updatedReservation,
        clients: reservation.clients,
        products: {
          flights: flightsWithKrw,
          hotels: hotelsWithKrw,
          tours: toursWithKrw,
          rental_cars: carsWithKrw,
          insurances: insurancesWithKrw
        }
      }
    });
  } catch (error) {
    console.error('예약 업데이트 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: isPostgrestError(error) ? error.message : '예약 변경 중 오류가 발생했습니다.',
        details: error
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { reservation_id } = (await request.json()) as { reservation_id: string };

    if (!reservation_id) {
      throw new Error('예약번호는 필수입니다.');
    }

    const supabase = await createClient();

    const productTables = ['flights', 'hotels', 'tours', 'rental_cars', 'insurances'] as const;

    const deletions = await Promise.all([
      ...productTables.map(table =>
        supabase.from(table).delete().eq('reservation_id', reservation_id)
      ),
      supabase.from('clients').delete().eq('reservation_id', reservation_id)
    ]);

    const deletionError = deletions.map(result => result.error).find(Boolean);
    if (deletionError) throw deletionError;

    const { error, count } = await supabase
      .from('reservations')
      .delete({ count: 'exact' })
      .eq('reservation_id', reservation_id);

    if (error) throw error;
    if (!count) throw new Error('예약 정보를 찾을 수 없습니다.');

    return NextResponse.json({
      message: `[${reservation_id}] 예약이 삭제되었습니다`,
      success: true
    });
  } catch (error) {
    console.error('예약 삭제 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: isPostgrestError(error) ? error.message : '예약 삭제 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
