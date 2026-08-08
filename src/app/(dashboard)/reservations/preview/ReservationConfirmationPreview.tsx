import { PAYMENT_STATUS_COLOR, PaymentStatus, TIME_ZONE } from '@/constants';
import type { ReservationResponse } from '@/types';
import { getJobInfo, toReadableAmount } from '@/utils';
import { Badge, Blockquote, Box, Flex, Heading, Section, Strong, Text } from '@radix-ui/themes';
import Image from 'next/image';
import type { ReactNode } from 'react';
import styles from './preview-table.module.css';

type ReservationConfirmationPreviewProps = {
  data: ReservationResponse;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString('ko-KR', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
}

function formatClientTitle(data: ReservationResponse): ReactNode {
  const clients = data.clients ?? [];
  const names = clients
    .filter(({ status }) => status !== 'Cancelled')
    .map(client => client.korean_name?.trim());

  if (!names.length) return '-';

  const mainClient = names.find(name => name === data.main_client_name?.trim()) ?? names[0];
  const orderedNames = [mainClient, ...names.filter(name => name !== mainClient)];

  if (orderedNames.length <= 2) {
    return (
      <>
        <Text as='span' size='4' weight='bold'>
          {orderedNames.join(', ')}
        </Text>
        <Text as='span'>님 귀하</Text>
      </>
    );
  }

  return (
    <>
      <Text as='span' size='4' weight='bold'>
        {`${orderedNames[0]}님`}
      </Text>
      <Text as='span'>{` 외 ${orderedNames.length - 1}인 귀하`}</Text>
    </>
  );
}

function formatClientName(client: { korean_name: string; is_main_client: boolean }) {
  const { korean_name: name, is_main_client } = client;
  const label = is_main_client ? '(대표)' : '';
  return label ? `${name}${label}` : name;
}

export function ReservationConfirmationPreview({ data }: ReservationConfirmationPreviewProps) {
  const flights = (data.products?.flights ?? []).filter(product => product.status !== 'Refunded');
  const hotels = (data.products?.hotels ?? []).filter(product => product.status !== 'Refunded');
  const tours = (data.products?.tours ?? []).filter(product => product.status !== 'Refunded');
  const rentalCars = (data.products?.rental_cars ?? []).filter(
    product => product.status !== 'Refunded'
  );
  const insurances = (data.products?.insurances ?? []).filter(
    product => product.status !== 'Refunded'
  );

  return (
    <Box>
      <Flex justify='center' align='center' gap='4' mb='3'>
        <Image src='/images/logo.png' width='90' height='40' alt='조인하와이' priority></Image>
        <Heading as='h2' size='7'>
          {`예약확인서 (${data.booking_platform})`}
        </Heading>
      </Flex>

      <Section size='1' className={styles.section}>
        <Flex justify='end' align='end' gap='1' mb='1'>
          {formatClientTitle(data)}
        </Flex>

        <div className={styles.outline}>
          <Box m='-1px'>
            <table className={styles.table}>
              <colgroup>
                <col width='100px' />
                <col width='150px' />
                <col width='100px' />
                <col />
                <col width='100px' />
                <col width='300px' />
              </colgroup>
              <tbody>
                <tr>
                  <th className={styles.th}>발행일</th>
                  <td className={styles.td}>
                    {data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'}
                  </td>
                  <th className={styles.th}>담당자</th>
                  <td className={styles.td}>{getJobInfo(data.author_email ?? '')}</td>
                  <th className={styles.th}>이메일</th>
                  <td className={styles.td}>
                    <a href='mailto:joinhawaii@joinhawaii.com'>joinhawaii@joinhawaii.com</a>
                  </td>
                </tr>
                <tr>
                  <th className={styles.th}>예약번호</th>
                  <td className={styles.td}>{data.reservation_id || '-'}</td>
                  <th className={styles.th}>여행종류</th>
                  <td className={styles.td}>
                    {[data.trip_type, `${data.clients?.length ?? 0}명`].filter(Boolean).join(' / ')}
                  </td>
                  <th className={styles.th}>여행일정</th>
                  <td className={styles.td}>
                    {data.start_date ? formatDate(data.start_date) : '-'} ~{' '}
                    {data.end_date ? formatDate(data.end_date) : '-'}
                    {data.nights && data.days ? ` (${data.nights}박 ${data.days}일)` : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </div>
      </Section>

      <Section size='1' className={styles.section}>
        <Heading as='h3' mb='2'>
          고객 정보
        </Heading>
        <div className={styles.outline}>
          <Box m='-1px'>
            <table className={styles.table}>
              <colgroup>
                <col width='140px' />
                <col width='200px' />
                <col width='60px' />
                <col width='180px' />
                <col width='160px' />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.th}>한글이름</th>
                  <th className={styles.th}>영문이름</th>
                  <th className={styles.th}>성별</th>
                  <th className={styles.th}>생년월일</th>
                  <th className={styles.th}>연락처</th>
                  <th className={styles.th}>이메일</th>
                </tr>
              </thead>
              <tbody>
                {data.clients?.map((client, idx) => (
                  <tr key={idx}>
                    <td className={styles.td}>{formatClientName(client)}</td>
                    <td className={styles.td}>{client.english_name}</td>
                    <td className={styles.td}>{client.gender}</td>
                    <td className={styles.td}>{client.resident_id}</td>
                    <td className={styles.td}>{client.phone_number}</td>
                    <td className={styles.td}>{client.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </div>
      </Section>

      <Section size='1' className={styles.section}>
        <Flex asChild justify='between' align='center' gap='1' mb='2'>
          <header>
            <Heading as='h3'>결제 정보</Heading>
            <Badge size='3' color={PAYMENT_STATUS_COLOR[data.payment_status]} variant='soft'>
              {PaymentStatus[data.payment_status]}
            </Badge>
          </header>
        </Flex>
        <div className={styles.outline}>
          <Box m='-1px'>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>예약금</th>
                  <th className={styles.th}>입금액 &#36;</th>
                  <th className={styles.th}>잔금 &#36;</th>
                  <th className={styles.th}>총액 &#8361;</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.td} align='right'>
                    <Text weight='bold' size='4' color='red'>
                      {toReadableAmount(Number(data?.reservation_fee), 'ko-KR', 'KRW')}
                    </Text>
                  </td>
                  <td className={styles.td} align='right'>
                    {toReadableAmount(Number(data?.deposit ?? 0))}
                  </td>
                  <td className={styles.td} align='right'>
                    {toReadableAmount(
                      Number(data?.total_amount ?? 0) - (Number(data?.deposit) || 0)
                    )}
                  </td>
                  <td className={styles.td} align='right'>
                    {toReadableAmount(Number(data?.total_amount ?? 0))}
                    {`(${toReadableAmount(Number(data?.total_amount_krw ?? 0), 'ko-KR', 'KRW')})`}
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </div>

        <Box mt='4'>
          <Blockquote>
            <Text as='p'>본 예약확인서는 계약서를 대신합니다.</Text>
            <Text as='p'>각 정보를 꼼꼼히 확인하시고 결제하시기 바랍니다.</Text>
            <Text as='p'>현금영수증은 국세청법에 의한 알선수수료에 대해서만 발행됩니다.</Text>
            <Text as='p'>환율은 각 결제시점의 매입환율이 적용됩니다.</Text>
          </Blockquote>
        </Box>
      </Section>

      {flights.length > 0 && (
        <Section size='1' className={styles.section}>
          <Heading as='h3' mb='2'>
            항공
          </Heading>
          <div className={styles.outline}>
            <Box m='-1px'>
              <table className={styles.table}>
                <colgroup>
                  <col width='100px' />
                  <col width='160px' />
                  <col />
                  <col width='160px' />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th className={styles.th}>편명</th>
                    <th className={styles.th}>출발시간</th>
                    <th className={styles.th}>출발지</th>
                    <th className={styles.th}>도착시간</th>
                    <th className={styles.th}>도착지</th>
                  </tr>
                </thead>
                {flights.map((flight, idx) => (
                  <tbody key={flight.id ?? idx}>
                    <tr>
                      <td className={styles.td}>{flight.flight_number || '-'}</td>
                      <td className={styles.td}>{formatDateTime(flight.departure_datetime)}</td>
                      <td className={styles.td}>{flight.departure_city || '-'}</td>
                      <td className={styles.td}>{formatDateTime(flight.arrival_datetime)}</td>
                      <td className={styles.td}>{flight.arrival_city || '-'}</td>
                    </tr>
                    {(flight.remarks || flight.rule) && (
                      <tr>
                        <td className={styles['inner-td']} colSpan={5}>
                          <Box m='-1px' mr='0'>
                            <table className={styles.table}>
                              <colgroup>
                                <col width='100.5객px' />
                                <col />
                              </colgroup>
                              <tbody>
                                {flight.remarks && (
                                  <tr>
                                    <th className={styles.th}>비고</th>
                                    <td className={styles.td} align='left'>
                                      {flight.remarks}
                                    </td>
                                  </tr>
                                )}
                                {flight.rule && (
                                  <tr>
                                    <th className={styles.th}>
                                      <Text color='red'>규정</Text>
                                    </th>
                                    <td className={styles.td} align='left'>
                                      <Text color='red'>{flight.rule}</Text>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </Box>
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </table>
            </Box>
          </div>
        </Section>
      )}

      {hotels.length > 0 && (
        <Section size='1' className={styles.section}>
          <Heading as='h3' mb='2'>
            호텔
          </Heading>
          <div className={styles.outline}>
            <Box m='-1px'>
              <table className={styles.table}>
                <colgroup>
                  <col width='90px' />
                  <col />
                  <col width='200px' />
                  <col width='120px' />
                  <col width='120px' />
                  <col width='120px' />
                </colgroup>
                <thead>
                  <tr>
                    <th className={styles.th}>지역</th>
                    <th className={styles.th}>호텔명</th>
                    <th className={styles.th}>객실타입</th>
                    <th className={styles.th}>베드타입</th>
                    <th className={styles.th}>리조트피</th>
                    <th className={styles.th}>조식</th>
                  </tr>
                </thead>
                {hotels.map((hotel, idx) => (
                  <tbody key={hotel.id ?? idx}>
                    <tr>
                      <td className={styles.td} rowSpan={hotel.additional_options.length ? 3 : 2}>
                        {hotel.region || '-'}
                      </td>
                      <td className={styles.td}>{hotel.hotel_name || '-'}</td>
                      <td className={styles.td}>{hotel.room_type || '-'}</td>
                      <td className={styles.td}>{hotel.bed_type || '-'}</td>
                      <td className={styles.td}>
                        {hotel.resort_fee_type === 'INCLUSION'
                          ? '포함'
                          : hotel.resort_fee_type === 'EXCLUSION'
                            ? '불포함'
                            : hotel.resort_fee_type === 'NO RESORT FEE'
                              ? '없음'
                              : '-'}
                      </td>
                      <td className={styles.td}>
                        {hotel.is_breakfast_included ? '포함' : '미포함'}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className={styles['inner-td']}>
                        <Box m='-1px' mr='0'>
                          <table className={styles.table}>
                            <colgroup>
                              <col />
                              <col width='200px' />
                              <col width='120px' />
                              <col width='239.5px' />
                            </colgroup>
                            <thead>
                              <tr>
                                <th className={styles.th}>숙박기간</th>
                                <th className={styles.th}>1박 요금</th>
                                <th className={styles.th}>숙박일</th>
                                <th className={styles.th}>계</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className={styles.td}>
                                  {[
                                    formatDate(hotel.check_in_date),
                                    formatDate(hotel.check_out_date)
                                  ]
                                    .filter(Boolean)
                                    .join(' ~ ')}
                                </td>
                                <td className={styles.td} align='right'>
                                  {toReadableAmount(hotel.nightly_rate)}
                                </td>
                                <td className={styles.td}>{hotel.nights ?? '-'}박</td>
                                <td className={styles.td} align='right'>
                                  {toReadableAmount(hotel.total_amount)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </Box>
                      </td>
                    </tr>
                    {hotel.additional_options.length > 0 && (
                      <tr>
                        <td colSpan={5} className={styles['inner-td']}>
                          <Box m='-1px' mr='0'>
                            <table className={styles.table}>
                              <colgroup>
                                <col />
                                <col width='200px' />
                                <col width='120px' />
                                <col width='239.5px' />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th className={styles.th}>추가사항</th>
                                  <th className={styles.th}>요금</th>
                                  <th className={styles.th}>수량</th>
                                  <th className={styles.th}>계</th>
                                </tr>
                              </thead>
                              <tbody>
                                {hotel.additional_options.map((option, idx) => (
                                  <tr key={option.id ?? idx}>
                                    <td className={styles.td}>{option.title || '-'}</td>
                                    <td className={styles.td} align='right'>
                                      {toReadableAmount(option.adult_price)}
                                    </td>
                                    <td className={styles.td}>{option.adult_count}</td>
                                    <td className={styles.td} align='right'>
                                      {toReadableAmount(option.total_amount)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Box>
                        </td>
                      </tr>
                    )}
                    {(hotel.remarks || hotel.rule) && (
                      <tr>
                        <td className={styles['inner-td']} colSpan={6}>
                          <Box m='-1px' mr='0'>
                            <table className={styles.table}>
                              <colgroup>
                                <col width='90.5px' />
                                <col />
                              </colgroup>
                              <tbody>
                                {hotel.remarks && (
                                  <tr>
                                    <th className={styles.th}>비고</th>
                                    <td className={styles.td} align='left'>
                                      {hotel.remarks}
                                    </td>
                                  </tr>
                                )}
                                {hotel.rule && (
                                  <tr>
                                    <th className={styles.th}>
                                      <Text color='red'>규정</Text>
                                    </th>
                                    <td className={styles.td} align='left'>
                                      <Text color='red'>{hotel.rule}</Text>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </Box>
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </table>
            </Box>
          </div>
        </Section>
      )}

      {tours.length > 0 && (
        <Section size='1' className={styles.section}>
          <Heading as='h3' mb='2'>
            선택관광
          </Heading>
          <div className={styles.outline}>
            <Box m='-1px'>
              <table className={styles.table}>
                <colgroup>
                  <col width='90px' />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th className={styles.th}>지역</th>
                    <th className={styles.th}>상품명</th>
                  </tr>
                </thead>
                {tours.map((tour, idx) => (
                  <tbody key={tour.id ?? idx}>
                    <tr>
                      <td className={styles.td} rowSpan={2}>
                        {tour.region || '-'}
                      </td>
                      <td className={styles.td}>{tour.name || '-'}</td>
                    </tr>
                    <tr>
                      <td className={styles['inner-td']}>
                        <Box m='-1px' mr='0'>
                          <table className={styles.table}>
                            <colgroup>
                              <col />
                              <col width='120px' />
                              <col width='120px' />
                              <col width='80px' />
                              <col width='80px' />
                              <col width='80px' />
                              <col width='120px' />
                            </colgroup>
                            <thead>
                              <tr>
                                <th className={styles.th}>행사일</th>
                                <th className={styles.th}>성인요금</th>
                                <th className={styles.th}>소아요금</th>
                                <th className={styles.th}>성인인원</th>
                                <th className={styles.th}>소아인원</th>
                                <th className={styles.th}>유아인원</th>
                                <th className={styles.th}>계</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className={styles.td}>
                                  {[formatDateTime(tour.start_date), formatDateTime(tour.end_date)]
                                    .filter(Boolean)
                                    .join(' / ')}
                                </td>
                                <td className={styles.td} align='right'>
                                  {toReadableAmount(tour.adult_price)}
                                </td>
                                <td className={styles.td} align='right'>
                                  {toReadableAmount(tour.children_price)}
                                </td>
                                <td className={styles.td}>{tour.adult_count}</td>
                                <td className={styles.td}>{tour.children_count}</td>
                                <td className={styles.td}>{tour.kids_count}</td>
                                <td className={styles.td} align='right'>
                                  {toReadableAmount(tour.total_amount)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </Box>
                      </td>
                    </tr>
                    {(tour.remarks || tour.rule) && (
                      <tr>
                        <td className={styles['inner-td']} colSpan={2}>
                          <Box m='-1px' mr='0'>
                            <table className={styles.table}>
                              <colgroup>
                                <col width='90.5px' />
                                <col />
                              </colgroup>
                              <tbody>
                                {tour.remarks && (
                                  <tr>
                                    <th className={styles.th}>비고</th>
                                    <td className={styles.td} align='left'>
                                      {tour.remarks}
                                    </td>
                                  </tr>
                                )}
                                {tour.rule && (
                                  <tr>
                                    <th className={styles.th}>
                                      <Text color='red'>규정</Text>
                                    </th>
                                    <td className={styles.td} align='left'>
                                      <Text color='red'>{tour.rule}</Text>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </Box>
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </table>
            </Box>
          </div>
        </Section>
      )}

      {rentalCars.length > 0 && (
        <Section size='1' className={styles.section}>
          <Heading as='h3' mb='2'>
            렌터카
          </Heading>
          <div className={styles.outline}>
            <Box m='-1px'>
              <table className={styles.table}>
                <colgroup>
                  <col width='90px' />
                  <col width='100px' />
                  <col />
                  <col width='240px' />
                  <col width='180px' />
                </colgroup>
                <thead>
                  <tr>
                    <th className={styles.th}>지역</th>
                    <th className={styles.th}>업체명</th>
                    <th className={styles.th}>차종</th>
                    <th className={styles.th}>조건</th>
                    <th className={styles.th}>운전자</th>
                  </tr>
                </thead>
                {rentalCars.map((car, idx) => (
                  <tbody key={car.id ?? idx}>
                    <tr>
                      <td className={styles.td} rowSpan={2}>
                        {car.region || '-'}
                      </td>
                      <td className={styles.td} rowSpan={2}>
                        {car.company || '-'}
                      </td>
                      <td className={styles.td}>{car.model || '-'}</td>
                      <td className={styles.td}>{car.options || '-'}</td>
                      <td className={styles.td}>{car.driver || '-'}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className={styles['inner-td']}>
                        <Box m='-1px' mr='0'>
                          <table className={styles.table}>
                            <colgroup>
                              <col />
                              <col />
                              <col width='120px' />
                              <col width='60px' />
                              <col width='119.5px' />
                            </colgroup>
                            <thead>
                              <tr>
                                <th className={styles.th}>인수 장소 / 시간</th>
                                <th className={styles.th}>반납 장소 / 시간</th>
                                <th className={styles.th}>1일 요금</th>
                                <th className={styles.th}>대여일</th>
                                <th className={styles.th}>계</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className={styles.td} style={{ whiteSpace: 'pre-line' }}>
                                  {[car.pickup_location, formatDateTime(car.pickup_date)]
                                    .filter(Boolean)
                                    .join('\n')}
                                </td>
                                <td className={styles.td} style={{ whiteSpace: 'pre-line' }}>
                                  {[car.return_location, formatDateTime(car.return_date)]
                                    .filter(Boolean)
                                    .join('\n')}
                                </td>
                                <td className={styles.td} align='right'>
                                  {toReadableAmount(car.daily_rate)}
                                </td>
                                <td className={styles.td}>{car.rental_days ?? '-'}일</td>
                                <td className={styles.td} align='right'>
                                  {toReadableAmount(car.total_amount)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </Box>
                      </td>
                    </tr>
                    {(car.remarks || car.rule) && (
                      <tr>
                        <td className={styles['inner-td']} colSpan={5}>
                          <Box m='-1px' mr='0'>
                            <table className={styles.table}>
                              <colgroup>
                                <col width='90.5px' />
                                <col />
                              </colgroup>
                              <tbody>
                                {car.remarks && (
                                  <tr>
                                    <th className={styles.th}>비고</th>
                                    <td className={styles.td} align='left'>
                                      {car.remarks}
                                    </td>
                                  </tr>
                                )}
                                {car.rule && (
                                  <tr>
                                    <th className={styles.th}>
                                      <Text color='red'>규정</Text>
                                    </th>
                                    <td className={styles.td} align='left'>
                                      <Text color='red'>{car.rule}</Text>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </Box>
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </table>
            </Box>
          </div>
        </Section>
      )}

      {insurances.length > 0 && (
        <Section size='1' className={styles.section}>
          <Heading as='h3' mb='2'>
            여행자보험
          </Heading>
          <div className={styles.outline}>
            <Box m='-1px'>
              <table className={styles.table}>
                <colgroup>
                  <col width='100px' />
                  <col width='200px' />
                  <col />
                  <col width='120px' />
                  <col width='120px' />
                  <col width='80px' />
                  <col width='80px' />
                  <col width='80px' />
                  <col width='100px' />
                </colgroup>
                <thead>
                  <tr>
                    <th className={styles.th}>보험사</th>
                    <th className={styles.th}>날짜</th>
                    <th className={styles.th}>조건</th>
                    <th className={styles.th}>성인요금</th>
                    <th className={styles.th}>소아요금</th>
                    <th className={styles.th}>성인인원</th>
                    <th className={styles.th}>소아인원</th>
                    <th className={styles.th}>유아인원</th>
                    <th className={styles.th}>계</th>
                  </tr>
                </thead>
                {insurances.map((insurance, idx) => (
                  <tbody key={insurance.id ?? idx}>
                    <tr>
                      <td className={styles.td}>{insurance.company || '-'}</td>
                      <td className={styles.td}>
                        {[formatDate(insurance.start_date), formatDate(insurance.end_date)]
                          .filter(Boolean)
                          .join(' ~ ')}
                      </td>
                      <td className={styles.td}>{insurance.condition || '-'}</td>
                      <td className={styles.td} align='right'>
                        {toReadableAmount(insurance.adult_price)}
                      </td>
                      <td className={styles.td} align='right'>
                        {toReadableAmount(insurance.children_price)}
                      </td>
                      <td className={styles.td}>{insurance.adult_count}</td>
                      <td className={styles.td}>{insurance.children_count}</td>
                      <td className={styles.td}>{insurance.kids_count}</td>
                      <td className={styles.td} align='right'>
                        {toReadableAmount(insurance.total_amount)}
                      </td>
                    </tr>
                    {(insurance.remarks || insurance.rule) && (
                      <tr>
                        <td className={styles['inner-td']} colSpan={9}>
                          <Box m='-1px' mr='0'>
                            <table className={styles.table}>
                              <colgroup>
                                <col width='100.5px' />
                                <col />
                              </colgroup>
                              <tbody>
                                {insurance.remarks && (
                                  <tr>
                                    <th className={styles.th}>비고</th>
                                    <td className={styles.td} align='left'>
                                      {insurance.remarks}
                                    </td>
                                  </tr>
                                )}
                                {insurance.rule && (
                                  <tr>
                                    <th className={styles.th}>
                                      <Text color='red'>규정</Text>
                                    </th>
                                    <td className={styles.td} align='left'>
                                      <Text color='red'>{insurance.rule}</Text>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </Box>
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </table>
            </Box>
          </div>
        </Section>
      )}

      <Blockquote>
        <Box>
          <Text as='p'>
            <Strong>홈페이지</Strong>{' '}
            <a href='https://www.joinhawaii.co.kr' target='_blank' rel='noreferrer'>
              https://www.joinhawaii.co.kr
            </a>
          </Text>
          <Text as='p'>
            <Strong>스마트 스토어</Strong>{' '}
            <a href='https://smartstore.naver.com/joinhawaii' target='_blank' rel='noreferrer'>
              https://smartstore.naver.com/joinhawaii
            </a>
          </Text>
          <Text as='p'>
            <Strong>네이버 카페</Strong>{' '}
            <a href='http://cafe.naver.com/goodhawaii' target='_blank' rel='noreferrer'>
              http://cafe.naver.com/goodhawaii
            </a>
          </Text>
          <Text as='p'>
            <Strong>카카오톡 채널 ID</Strong>{' '}
            <a href='http://pf.kakao.com/_Hnhxkxd' target='_blank' rel='noreferrer'>
              조인하와이
            </a>
          </Text>
        </Box>

        <Box asChild mt='3'>
          <address style={{ fontStyle: 'normal' }}>
            <Text as='p'>
              <Strong>하와이 사무소</Strong>
            </Text>
            <Text as='p'>
              <Strong>OPEN</Strong> 10:00 AM - 06:00 PM (현지 기준, 공휴일 휴무)
            </Text>
            <Text as='p'>
              <Strong>TEL</Strong> 1 808 772 2691
            </Text>
            <Text as='p'>
              <Strong>카카오톡 ID</Strong>{' '}
              <a href='https://open.kakao.com/o/s4bqvFmh' target='_blank' rel='noreferrer'>
                joinhawaiiusa
              </a>
            </Text>
          </address>
        </Box>
      </Blockquote>
    </Box>
  );
}
