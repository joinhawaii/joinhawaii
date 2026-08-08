import type { selectTriggerPropDefs } from '@radix-ui/themes/components/select.props';
import type {
  AdditionalOptions,
  PaymentStatusKey,
  ProductStatusKey,
  ProductsType,
  ProductType
} from '../types';

import {
  DIAMOND_HEAD_HIKING,
  HAWAII_SNAP,
  HAWAII_SURFING,
  KANEOHE_SANDBAR_ADVENTURE,
  KUALOA_RANCH_ELECTRIC_MOUNTAIN_BIKE_TOUR_NO_PICKUP,
  KUALOA_RANCH_ELECTRIC_MOUNTAIN_BIKE_TOUR_PICKUP,
  KUALOA_RANCH_UTV_RAPTOR_ADVENTURE_NO_PICKUP,
  KUALOA_RANCH_UTV_RAPTOR_ADVENTURE_PICKUP,
  KUALOA_RANCH_UTV_RIDE_ALONG_ADVENTURE_NO_PICKUP,
  KUALOA_RANCH_UTV_RIDE_ALONG_ADVENTURE_PICKUP,
  ONE_DAY_TOUR,
  STAR_OF_HONOLULU_3STAR_NO_PICKUP,
  STAR_OF_HONOLULU_3STAR_PICKUP
} from './tour-notes';

export * from './query-keys';

export const TIME_ZONE = 'UTC';

export const CUSTOM_LABEL = '직접입력';

export const PER_PAGE = '20';

export const GENDER_TYPE = ['MR', 'MS', 'MSTR', 'MISS'] as const;
export type Gender = (typeof GENDER_TYPE)[number] | (string & {});

export enum ProductStatus {
  Pending = '예약요청',
  InProgress = '예약진행',
  Confirmed = '예약완료',
  ChangeRequested = '변경요청',
  CancelRequested = '취소요청',
  Cancelled = '취소완료',
  RefundRequested = '환불요청',
  Refunded = '환불완료',
  OnHold = '보류',
  Checked = '확인'
}

export const VOIDED_PRODUCT_STATUSES: ProductStatusKey[] = ['Cancelled', 'Refunded'];

export enum PaymentStatus {
  Unpaid = '미납',
  Deposit = '예약금',
  Full = '완불',
  Refunded = '환불'
}

export const CONTACT_NUMBER = '02-402-1040';

export const JOB_FUNCTION: Record<string, { title: string; tel?: string }> = {
  'joinhawaiikoreausa@gmail.com': {
    title: '대표',
    tel: CONTACT_NUMBER
  },
  'joinhawaii@joinhawaii.com': {
    title: '대표',
    tel: CONTACT_NUMBER
  },
  'joinhawaiiusa@gmail.com': {
    title: '실장',
    tel: CONTACT_NUMBER
  },
  'tjsdk525@gmail.com': {
    title: '팀장',
    tel: CONTACT_NUMBER
  },
  'minji5686@gmail.com': {
    title: '팀장',
    tel: CONTACT_NUMBER
  },
  'hckang80@gmail.com': {
    title: '관리자'
  }
};

export const RENTAL_CAR_SPECIAL_OPTIONS = ['3종보험, TAX', '3종보험, TAX, 주유, 추가운전자'];

export const PICKUP_LOCATIONS = [
  'Honolulu Airport',
  'Kahala Hotel and Resort',
  'Hyatt Regency Waikiki (2F)',
  'Imperial Hotel',
  'Kahului Airport Maui',
  'Kona Keahole Airport',
  'Hilo Airport',
  'Lihue Airport'
];

export const CAR_TYPES = [
  'Intermediate car',
  'Standard car',
  'Fullsize car',
  'Premium car',
  'Luxury car',
  'Intermediate all-terrain',
  'Standard convertible',
  'Intermediate SUV',
  'Standard SUV',
  'Fullsize recreational',
  'Mini van',
  'Fullsize SUV',
  'Premium SUV'
] as const;

export const BED_TYPE_LIST = ['1 BED', '2 BEDS', '3 BEDS', '4 BEDS'] as const;

export const HOTEL_ROOM_TYPE_LIST = [
  'CITY VIEW',
  'RESORT VIEW',
  'OCEAN VIEW',
  'OCEAN FRONT',
  'PARTIAL OCEAN VIEW',
  'DIAMOND HEAD OCEAN FRONT',
  'DELUXE OCEAN VIEW',
  'RUN OF OCEAN',
  'RUN OF HOUSE',
  'PAOKALANI OCEAN VIEW',
  'KEALOHILANI OCEAN VIEW'
];

export const RESORT_FEE_TYPE_LIST = [
  {
    value: 'INCLUSION',
    label: '포함'
  },
  {
    value: 'EXCLUSION',
    label: '불포함'
  },
  {
    value: 'NO RESORT FEE',
    label: '없음'
  }
];

export type GroupSelectOption = {
  value: string;
  label: string;
  en_label?: string;
};
export const ROOM_TYPES = ['1BED', '2BED', '1BED/2BED', '2BED/3BED', '3BED', '4BED'] as const;
export const REGIONS = ['오아후', '마우이', '빅아일랜드', '카우아이'] as const;
export type Region = (typeof REGIONS)[number] | (string & {});
export const HOTELS: Record<Region, GroupSelectOption[]> = {
  오아후: [
    { value: '더 카할라 리조트', label: '더 카할라 리조트', en_label: 'THE KAHALA RESORT' },
    { value: '더 트윈 핀 비치', label: '더 트윈 핀 비치', en_label: 'THE TWIN FIN BEACH' },
    {
      value: '로얄 하와이언 럭셔리 컬렉션',
      label: '로얄 하와이언 럭셔리 컬렉션',
      en_label: 'ROYAL HAWAIIAN LUXURY COLLECTION'
    },
    {
      value: '리츠칼튼 레지던스 와이키키',
      label: '리츠칼튼 레지던스 와이키키',
      en_label: 'THE RITZCARLTON RESIDENCES WAIKIKI'
    },
    {
      value: '모아나 서프라이더 웨스틴 리조트',
      label: '모아나 서프라이더 웨스틴 리조트',
      en_label: 'MOANA SURFRIDER A WESTIN RESORT SPA WAIKIKI BEACH'
    },
    { value: '쇼어라인 와이키키', label: '쇼어라인 와이키키', en_label: 'SHORELINE WAIKIKI' },
    {
      value: '쉐라톤 와이키키 비치 리조트',
      label: '쉐라톤 와이키키 비치 리조트',
      en_label: 'SHERATON WAIKIKI BEACH RESORT'
    },
    {
      value: '쉐라톤 프린세스 카이울라니',
      label: '쉐라톤 프린세스 카이울라니',
      en_label: 'SHERATON PRINCESS KAIULANI'
    },
    {
      value: '아웃리거 리프 와키키키 비치 리조트',
      label: '아웃리거 리프 와키키키 비치 리조트',
      en_label: 'OUTRIGGER REEF WAIKIKI BEACH RESORT'
    },
    {
      value: '아웃리거 와이키키 비치 리조트',
      label: '아웃리거 와이키키 비치 리조트',
      en_label: 'OUTRIGGER WAIKIKI BEACH RESORT'
    },
    {
      value: '알로힐라니 리조트 와이키키 비치',
      label: '알로힐라니 리조트 와이키키 비치',
      en_label: 'ALOHILANI RESORT WAIKIKI BEACH'
    },
    {
      value: '애스톤 와이키키 반얀',
      label: '애스톤 와이키키 반얀',
      en_label: 'ASTON WAIKIKI BANYAN'
    },
    {
      value: '애스톤 와이키키 비치 타워',
      label: '애스톤 와이키키 비치 타워',
      en_label: 'ASTON WAIKIKI BEACH TOWER'
    },
    {
      value: '애스톤 와이키키 선셋',
      label: '애스톤 와이키키 선셋',
      en_label: 'ASTON WAIKIKI SUNSET'
    },
    {
      value: '엠버시 스위트 바이 힐튼 와이키키 비치 워크',
      label: '엠버시 스위트 바이 힐튼 와이키키 비치 워크',
      en_label: 'EMBASSY SUITES BY HILTON WAIKIKI BEACH WALK'
    },
    {
      value: '와이키키 리조트 호텔',
      label: '와이키키 리조트 호텔',
      en_label: 'WAIKIKI RESORT HOTEL'
    },
    {
      value: '와이키키 비치 메리어트 리조트 & 스파',
      label: '와이키키 비치 메리어트 리조트 & 스파',
      en_label: 'WAIKIKI BEACH MARRIOTT RESORT'
    },
    {
      value: '일리카이 호텔 & 럭셔리 스위트',
      label: '일리카이 호텔 & 럭셔리 스위트',
      en_label: 'ILIKAI HOTEL LUXURY SUITES'
    },
    {
      value: '카 라이 와이키키 비치',
      label: '카 라이 와이키키 비치',
      en_label: 'KA LAI WAIKIKI BEACH'
    },
    {
      value: '코코넛 와이키키 호텔',
      label: '코코넛 와이키키 호텔',
      en_label: 'COCONUT WAIKIKI HOTEL'
    },
    {
      value: '코트야드 바이 메리어트 와이키키 비치',
      label: '코트야드 바이 메리어트 와이키키 비치',
      en_label: 'COURTYARD BY MARRIOTT WAIKIKI BEACH'
    },
    { value: '퀸 카피올라니 호텔', label: '퀸 카피올라니 호텔', en_label: 'QUEEN KAPIOLANI HOTEL' },
    { value: '파크 쇼어 와이키키', label: '파크 쇼어 와이키키', en_label: 'PARK SHORE WAIKIKI' },
    {
      value: '포시즌 리조트 오아후 앳 코올리나',
      label: '포시즌 리조트 오아후 앳 코올리나',
      en_label: 'FOUR SEASONS RESORT OAHU AT KO OLINA'
    },
    { value: '프린스 와이키키', label: '프린스 와이키키', en_label: 'PRINCE WAIKIKI HOTEL' },
    {
      value: '하얏트 리젠시 와이키키 비치 리조트 & 스파',
      label: '하얏트 리젠시 와이키키 비치 리조트 & 스파',
      en_label: 'HYATT REGENCY WAIKIKI BEACH RESORT AND SPA'
    },
    {
      value: '하얏트 센트릭 와이키키 비치',
      label: '하얏트 센트릭 와이키키 비치',
      en_label: 'HYATT CENTRIC WAIKIKI BEACH'
    },
    {
      value: '하얏트 플레이스 와이키키 비치',
      label: '하얏트 플레이스 와이키키 비치',
      en_label: 'HYATT PLACE WAIKIKI BEACH'
    },
    { value: '할레쿨라니', label: '할레쿨라니', en_label: 'HALEKULANI' },
    { value: '호텔 라 크로익스', label: '호텔 라 크로익스', en_label: 'HOTEL LA CROIX' },
    {
      value: '홀리데이 인 익스프레스 와이키키',
      label: '홀리데이 인 익스프레스 와이키키',
      en_label: 'HOLIDAY INN EXPRESS WAIKIKI'
    },
    {
      value: '힐튼 가든 인 와이키키 비치',
      label: '힐튼 가든 인 와이키키 비치',
      en_label: 'HILTON GARDEN INN WAIKIKI BEACH'
    },
    { value: '힐튼 와이키키 비치', label: '힐튼 와이키키 비치', en_label: 'HILTON WAIKIKI BEACH' },
    {
      value: '힐튼 하와이안 빌리지',
      label: '힐튼 하와이안 빌리지',
      en_label: 'HILTON HAWAIIAN VILLAGE'
    }
  ],
  마우이: [
    {
      value: '그랜드 와일레아 리조트',
      label: '그랜드 와일레아 리조트',
      en_label: 'GRAND WAILEA RESORT'
    },
    {
      value: '더 웨스틴 마우이 리조트',
      label: '더 웨스틴 마우이 리조트',
      en_label: 'THE WESTIN MAUI RESORT'
    },
    {
      value: '리츠칼튼 카팔루아',
      label: '리츠칼튼 카팔루아',
      en_label: 'THE RITZCARLTON KAPALUA'
    },
    {
      value: '레지던스 인 마우이 와일레아',
      label: '레지던스 인 마우이 와일레아',
      en_label: 'RESIDENCE INN MAUI WAILEA'
    },
    {
      value: '로얄 라하이나 리조트',
      label: '로얄 라하이나 리조트',
      en_label: 'ROYAL LAHAINA RESORT'
    },
    {
      value: '마우이 비치 호텔',
      label: '마우이 비치 호텔',
      en_label: 'MAUI BEACH HOTEL'
    },
    {
      value: '쉐라톤 마우이 리조트 앤 스파',
      label: '쉐라톤 마우이 리조트 앤 스파',
      en_label: 'SHERATON MAUI RESORT AND SPA'
    },
    {
      value: '안다즈 마우이 앳 와일레아',
      label: '안다즈 마우이 앳 와일레아',
      en_label: 'ANDAZ MAUI AT WAILEA'
    },
    {
      value: '애스톤 카아나팔리 쇼어즈',
      label: '애스톤 카아나팔리 쇼어즈',
      en_label: 'ASTON KAANAPALI SHORES'
    },
    {
      value: '와일레아 비치 메리어트 리조트',
      label: '와일레아 비치 메리어트 리조트',
      en_label: 'WAILEA BEACH MARRIOTT RESORT'
    },
    {
      value: '카아나팔리 오션 인 리조트',
      label: '카아나팔리 오션 인 리조트',
      en_label: 'KAANAPALI OCEAN INN RESORT'
    },
    {
      value: '코트야드 마우이 카훌루이 에어포트',
      label: '코트야드 마우이 카훌루이 에어포트',
      en_label: 'COURTYARD MAUI KAHULUI AIRPORT'
    },
    {
      value: '하얏트 리젠시 마우이',
      label: '하얏트 리젠시 마우이',
      en_label: 'HYATT REGENCY MAUI RESORT AND SPA'
    }
  ],
  빅아일랜드: [
    {
      value: '더 웨스틴 하푸나 비치리조트',
      label: '더 웨스틴 하푸나 비치리조트',
      en_label: 'THE WESTIN HAPUNA BEACH RESORT'
    },
    {
      value: '그랜드 나닐로아 호텔 힐로 더블트리 바이 힐튼',
      label: '그랜드 나닐로아 호텔 힐로 더블트리 바이 힐튼',
      en_label: 'GRAND NANILOA HOTEL HILO A DOUBLETREE BY HILTON'
    },
    {
      value: '로얄 코나 리조트',
      label: '로얄 코나 리조트',
      en_label: 'ROYAL KONA RESORT'
    },
    {
      value: '아웃리거 코나 리조트',
      label: '아웃리거 코나 리조트',
      en_label: 'OUTRIGGER KONA AT KEAUHOU BAY'
    },
    {
      value: '애스톤 코나 바이 더 시',
      label: '애스톤 코나 바이 더 시',
      en_label: 'ASTON KONA BY THE SEA'
    },
    {
      value: '코트야드 킹 카메하메하 코나 비치',
      label: '코트야드 킹 카메하메하 코나 비치',
      en_label: 'COURTYARD KING KAMEHAMEHAS KONA BEACH HOTEL'
    },
    {
      value: '페어몬트 오키드 마우나 라니',
      label: '페어몬트 오키드 마우나 라니',
      en_label: 'FAIRMONT ORCHID MAUNA LANI'
    },
    {
      value: '와이콜로아 비치 메리어트 리조트 앤 스파',
      label: '와이콜로아 비치 메리어트 리조트 앤 스파',
      en_label: 'WAIKOLOA BEACH MARRIOTT RESORT SPA'
    },
    {
      value: '힐튼 와이콜로아 빌리지',
      label: '힐튼 와이콜로아 빌리지',
      en_label: 'HILTON WAIKOLOA VILLAGE'
    }
  ],
  카우아이: [
    {
      value: '그랜드 하얏트 카우아이 리조트 앤 스파',
      label: '그랜드 하얏트 카우아이 리조트 앤 스파',
      en_label: 'GRAND HYATT KAUAI RESORT SPA'
    },
    {
      value: '쉐라톤 카우아이 리조트',
      label: '쉐라톤 카우아이 리조트',
      en_label: 'SHERATON KAUAI RESORT'
    },
    {
      value: '쉐라톤 카우아이 엣 코코넛 비치',
      label: '쉐라톤 카우아이 엣 코코넛 비치',
      en_label: 'SHERATON KAUAI AT COCONUT BEACH'
    }
  ]
};

export const TRIP_TYPES = ['허니문', '가족여행', '일반', '단체'] as const;
export type TripType = (typeof TRIP_TYPES)[number] | (string & {});

export const TRAVEL_CATEGORIES = ['자유여행', '패키지'] as const;
export type TravelCategory = (typeof TRAVEL_CATEGORIES)[number] | (string & {});

export const PLATFORMS = ['B2C', 'B2B', '플랫폼'] as const;
export type Platform = (typeof PLATFORMS)[number] | (string & {});
export const BOOKING_PLATFORM_OPTIONS: Record<Platform, GroupSelectOption[]> = {
  B2C: [
    { value: '홈페이지', label: '홈페이지' },
    { value: '조인하와이', label: '조인하와이' }
  ],
  B2B: [
    { value: '샬레', label: '샬레' },
    { value: '마이투어스토리', label: '마이투어스토리' },
    { value: '엘스투어', label: '엘스투어' },
    { value: '내일투어', label: '내일투어' },
    { value: '보성블루투어', label: '보성블루투어' },
    { value: '트레비아', label: '트레비아' },
    { value: '가야투어', label: '가야투어' },
    { value: '여행할때', label: '여행할때' },
    { value: '오리엔탈', label: '오리엔탈' },
    { value: '리조트라이프', label: '리조트라이프' },
    { value: '스테이앤모어', label: '스테이앤모어' },
    { value: '투어앤모어', label: '투어앤모어' }
  ],
  플랫폼: [
    { value: '네이버', label: '네이버' },
    { value: '마이리얼트립', label: '마이리얼트립' },
    { value: '와그', label: '와그' },
    { value: '클룩', label: '클룩' },
    { value: '트리플', label: '트리플' }
  ]
};

export const TOURS = ['공항셔틀', '일주관광', '해양스포츠', '액티비티', '스냅', '기타'] as const;
export type TourCategory = (typeof TOURS)[number] | (string & {});
export type TourOption = GroupSelectOption & {
  arrival_location?: string;
  delivery_notes?: string;
  guide_notes?: string;
  confirmation_number?: string;
};
export const TOURS_OPTIONS: Record<TourCategory, TourOption[]> = {
  공항셔틀: [
    {
      value: '[공항 셔틀서비스]한인택시 단독 공항-와이키키 픽업',
      label: '[공항 셔틀서비스]한인택시 단독 공항-와이키키 픽업',
      en_label: 'AIRPORT TRANSPORTATION AIRPORT-WAIKIKI PICKUP',
      confirmation_number: 'ROYAL',
      arrival_location:
        '<p>비행기 내리신 후 (수화물 찾기 전) 1-808-554-7788 택시 업체 번호로 도착하셨다고 전화 또는</p><p>카카오톡 연락 부탁드립니다. (번호 연결이 안될 시 1-1808-554-7788로 검색) 기사님과의 미팅</p><p>장소 안내드립니다.</p><p>※ 문의사항이 있으시거나 도움이 필요하실 경우 하단에 기재된 조인하와이 현지 연락처로</p><p>문의주시기 바랍니다.</p>',
      delivery_notes:
        '<ul><li><p><strong>카카오톡 친구 추가 방법</strong></p></li><li><p>카카오톡 상단 사람 아이콘 클릭 - 연락처로 추가 - 이름과 연락처(국가번호 +1 선택) 기입 후 확인</p></li></ul><p><span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/d749cede-0817-4727-b2e1-56f88b1eeb95.png" alt="공항픽업.png" title="" width="null" height="null" style="max-width: nullpx" data-keep-ratio="true" class=""></span></span></p>',
      guide_notes:
        '<ul><li><p>본 바우처를 캡쳐 또는 출력하여 가져가시기 바랍니다. 바우처 미 지참시 진행이 불가합니다.</p></li><li><p>수화물은 최대 4개까지 적재 가능합니다.</p></li><li><p>오아후(호놀룰루) 공항 도착하시는대로 안내 되어있는 택시 업체 번호로 연락하시기 바랍니다.</p></li><li><p><span style="color: rgb(239, 68, 68);"><strong>항공 스케줄 변경이나 연착이 있을 경우 위 택시 연락처로 꼭 연락을 주셔야 픽업 진행이 가능하며, 연락이 없을 경우 진행이 불가할 수 있습니다.</strong></span></p></li><li><p>입국심사 또는 수화물 수령이 지연되는 경우 위 택시 연락처로 연락주시기 바랍니다.</p></li><li><p>당일 교통사정에 의해 픽업시간이 5~10분 정도 지연될 수 있으며, 정해진 픽업장소를 이탈하지 마시고, 택시 업체로 연락주시기 바랍니다.</p></li><li><p>개인행동으로 인한 행사 불참 시에는 별도의 연락없이 진행되며 전액 환불 불가합니다.</p></li><li><p>상업용 차량에는 카시트 장착의 의무가 없으며, 장착이 불가합니다.</p></li></ul>'
    },
    {
      value: '[공항 셔틀서비스]한인택시 단독 와이키키-공항 샌딩',
      label: '[공항 셔틀서비스]한인택시 단독 와이키키-공항 샌딩',
      en_label: 'AIRPORT TRANSPORTATION WAIKIKI-AIRPORT SANDING',
      confirmation_number: 'ROYAL',
      arrival_location:
        '<p>샌딩의 시간과 장소는<strong> 샌딩 전 날 17시까지 </strong>1-808-554-7788 택시 업체 번호 전화 또는 카카오톡</p><p>연락하시어 미팅 희망하시는 시간/장소 직접 말씀하시기 바랍니다. (번호 연결이 안될 시 1-1808-554-7788로 검색)</p><p>※ 문의사항이 있으시거나 도움이 필요하실 경우 하단에 기재된 조인하와이 현지 연락처로</p><p>문의주시기 바랍니다.</p>',
      delivery_notes:
        '<ul><li><p><strong>카카오톡 친구 추가 방법</strong></p></li><li><p>카카오톡 상단 사람 아이콘 클릭 - 연락처로 추가 - 이름과 연락처(국가번호 +1 선택) 기입 후 확인</p></li></ul><p><span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/ab76acc0-32b8-46b7-840b-9c095a7d3aeb.png" alt="공항픽업.png" title="" width="null" height="null" style="max-width: nullpx" data-keep-ratio="true" class=""></span></span></p>',
      guide_notes:
        '<ul><li><p>본 바우처를 캡쳐 또는 출력하여 가져가시기 바랍니다. 바우처 미 지참시 진행이 불가합니다.</p></li><li><p>수화물은 최대 4개까지 적재 가능합니다.</p></li><li><p><span style="color: rgb(239, 68, 68);"><strong>항공 스케줄 변경이나 연착이 있을 경우 위 택시 연락처로 꼭 연락을 주셔야 픽업 진행이 가능하며, 연락이 없을 경우 진행이 불가할 수 있습니다.</strong></span></p></li><li><p>당일 교통사정에 의해 픽업시간이 5~10분 정도 지연될 수 있으며, 정해진 픽업장소를 이탈하지 마시고, 택시 업체로 연락주시기 바랍니다.</p></li><li><p><span style="color: rgb(239, 68, 68);"><strong>픽업장소와 시간은 샌딩 전 날 17시까지 정하셔서 전화 또는 카카오톡으로 요청 부탁드립니다. 도움이 필요하신 경우에는 조인하와이 현지 연락처로 연락주시기 바랍니다.</strong></span></p></li><li><p>개인행동으로 인한 행사 불참 시에는 별도의 연락없이 진행되며 전액 환불 불가합니다.</p></li><li><p>상업용 차량에는 카시트 장착의 의무가 없으며, 장착이 불가합니다.</p></li></ul>'
    },
    {
      value: '[공항 셔틀서비스]한인택시 단독 공항-와이키키 픽업샌딩 왕복',
      label: '[공항 셔틀서비스]한인택시 단독 공항-와이키키 픽업샌딩 왕복',
      en_label: 'AIRPORT TRANSPORTATION AIRPORT-WAIKIKI',
      confirmation_number: 'ROYAL',
      arrival_location:
        '<p><span style="color: rgb(23, 23, 23);"><strong>하와이 입국 셔틀 : </strong></span>비행기 내리신 후 (수화물 찾기 전) 1-808-554-7788 택시 업체 번호로 도착하셨다고 전화 또는 카카오톡 연락 부탁드립니다. (번호 연결이 안될 시 1-1808-554-7788로 검색)</p><p>기사님과의 미팅 장소 안내드립니다.</p><p></p><p><span style="color: rgb(23, 23, 23);"><strong>하와이 출국 셔틀 : </strong></span>샌딩의 시간과 장소는 샌딩 전 날 17시까지 1-808-554-7788 택시 업체 번호</p><p>전화 또는 카카오톡 연락하시어 미팅 희망하시는 시간/장소 직접 말씀하시기 바랍니다.</p><p>(번호 연결이 안될 시 1-1808-554-7788로 검색)</p><p></p><p>※ 문의사항이 있으시거나 도움이 필요하실 경우 하단에 기재된 조인하와이 현지 연락처로 문의주시기 바랍니다.</p>',
      delivery_notes:
        '<ul><li><p><strong>카카오톡 친구 추가 방법</strong></p></li><li><p>카카오톡 상단 사람 아이콘 클릭 - 연락처로 추가 - 이름과 연락처(국가번호 +1 선택) 기입 후 확인<span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/c7b79365-df47-4078-94f8-499bc9ccfbc7.png" alt="공항픽업.png" title="" width="null" height="null" style="max-width: nullpx" data-keep-ratio="true" class=""></span></span></p></li></ul>',
      guide_notes:
        '<ul><li><p>본 바우처를 캡쳐 또는 출력하여 가져가시기 바랍니다. 바우처 미 지참시 진행이 불가합니다.</p></li><li><p>수화물은 최대 4개까지 적재 가능합니다.</p></li><li><p>오아후(호놀룰루) 공항 도착하시는대로 안내 되어있는 택시 업체 번호로 연락하시기 바랍니다.</p></li><li><p><span style="color: rgb(239, 68, 68);"><strong>항공 스케줄 변경이나 연착이 있을 경우 위 택시 연락처로 꼭 연락을 주셔야 픽업 진행이 가능하며, 연락이 없을 경우 진행이 불가할 수 있습니다.</strong></span></p></li><li><p>입국심사 또는 수화물 수령이 지연되는 경우 위 택시 연락처로 연락주시기 바랍니다.</p></li><li><p>당일 교통사정에 의해 픽업시간이 5~10분 정도 지연될 수 있으며, 정해진 픽업장소를 이탈하지 마시고, 택시 업체로 연락주시기 바랍니다.</p></li><li><p><span style="color: rgb(239, 68, 68);"><strong>하와이 출국 셔틀 : 픽업장소와 시간은 샌딩 전 날 17시까지 정하셔서 전화 또는 카카오톡으로 요청 부탁드립니다. 도움이 필요하신 경우에는 조인하와이 현지 연락처로 연락주시기 바랍니다.</strong></span></p></li><li><p>개인행동으로 인한 행사 불참 시에는 별도의 연락없이 진행되며 전액 환불 불가합니다.</p></li><li><p>상업용 차량에는 카시트 장착의 의무가 없으며, 장착이 불가합니다.</p></li></ul>'
    },
    {
      value: '[공항 셔틀서비스]10인승 단독 공항-와이키키 픽업',
      label: '[공항 셔틀서비스]10인승 단독 공항-와이키키 픽업',
      en_label: 'AIRPORT TRANSPORTATION AIRPORT-WAIKIKI PICKUP 10PAX'
    },
    {
      value: '[공항 셔틀서비스]10인승 단독 와이키키-공항 샌딩',
      label: '[공항 셔틀서비스]10인승 단독 와이키키-공항 샌딩',
      en_label: 'AIRPORT TRANSPORTATION WAIKIKI-AIRPORT SANDING 10PAX'
    },
    {
      value: '[공항 셔틀서비스]10인승 단독 공항-와이키키 픽업샌딩 왕복',
      label: '[공항 셔틀서비스]10인승 단독 공항-와이키키 픽업샌딩 왕복',
      en_label: 'AIRPORT TRANSPORTATION AIRPORT-WAIKIKI 10PAX'
    }
  ],
  일주관광: [
    {
      value: '[오아후섬 투어]단독 2~3인승',
      label: '[오아후섬 투어]단독 2~3인승',
      en_label: 'OAHU ISLAND TOUR CHARTER 2~3PAX'
    },
    {
      value: '[오아후섬 투어]단독 4~5인승',
      label: '[오아후섬 투어]단독 4~5인승',
      en_label: 'OAHU ISLAND TOUR CHARTER 4~5PAX'
    },
    {
      value: '[오아후섬 투어]단독 10인승',
      label: '[오아후섬 투어]단독 10인승',
      en_label: 'OAHU ISLAND TOUR CHARTER 10PAX'
    },
    {
      value: '[오아후섬 투어]합류',
      label: '[오아후섬 투어]합류',
      en_label: 'OAHU ISLAND TOUR JOIN',
      arrival_location:
        '<p><strong>섬투어 전날 가이드 분께서 카카오톡으로 픽업장소와 시간 안내드립니다.</strong></p><p><span style="color: rgb(59, 130, 246);"><strong>투어 전날 오후 5시까지</strong></span> 안내를 받지 못하셨다면, 조인하와이 현지 연락처 (1-808-772-2691)로</p><p>연락부탁드립니다.</p>',
      delivery_notes:
        '<ul><li><p>카카오톡 설정 - 친구 카테고리에서 <span style="color: rgb(239, 68, 68);"><strong>\'전화번호로 친구 추가 허용\'</strong></span>을 활성화 해주시기 바랍니다.</p></li></ul>',
      guide_notes:
        '<ul><li><p>본 바우처를 출력 또는 캡쳐하여 가져가시기 바랍니다.</p></li><li><p>중식(카후쿠 새우트럭) 포함입니다.</p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>가이드팁($10/인) 현장결제 입니다.</strong></span></p></li><li><p>픽업시간 보다 10분 일찍 픽업장소에서 대기하여 주시기 바랍니다.</p></li><li><p>픽업시간이 5분 정도 지연될 경우 픽업장소를 이탈하지 마시고, 조인하와이 현지 연락처로 연락주시기 바랍니다.</p></li><li><p>픽업시간 지연 시 연락을 주시지 않아 픽업이 안되었을 경우 취소 및 환불이 불가합니다.</p></li><li><p>픽업시간 불이행으로 인한 행사 불참 시에는 별도의 연락은 드리지 않으며, 전액 환불 불가합니다.</p></li></ul>'
    },
    {
      value: '[일일관광]빅아일랜드 일일관광 와이키키픽업',
      label: '[일일관광]빅아일랜드 일일관광 와이키키픽업',
      en_label: 'ONE DAY BIGISLAND TOUR WAIKIKI',
      ...ONE_DAY_TOUR
    },
    {
      value: '[일일관광]빅아일랜드 일일관광 코나/힐로픽업',
      label: '[일일관광]빅아일랜드 일일관광 코나/힐로픽업',
      en_label: 'ONE DAY BIGISLAND TOUR KONA/HILLO',
      arrival_location:
        '<p><strong>평균 08:30 AM ~ 09:30 AM (투어 전 날 정확한 픽업 시간 안내드립니다.)</strong></p><p></p><p>King Kamehameha&nbsp; 호텔 - 주차장 입구쪽에 있는 벤치 입니다.</p><p><span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/f3e3af9d-e59f-47c3-b01c-fc479a942afb.png" alt="King Kamehameha 빅섬.png" title="" width="null" height="null" style="max-width: nullpx" data-keep-ratio="true" class=""></span></span></p>',
      delivery_notes:
        '<ul><li><p>카카오톡 설정 - 친구 카테고리에서<span style="color: rgb(239, 68, 68);"><strong> \'전화번호로 친구 추가 허용\'을 활성화 </strong></span>해주시기 바랍니다. &nbsp;</p></li><li><p>17시까지 카톡을 못 받으셨을 경우 <span style="color: rgb(59, 130, 246);"><strong>현지 연락처로 먼저 연락</strong></span> 부탁드립니다. (카톡ID : joinhawaiiusa / 연락처 : 1-808-772-2691 )</p></li></ul>',
      guide_notes:
        '<ul><li><p><span style="color: rgb(59, 130, 246);"><strong>픽업시간은 투어 전날 오후 5시 이전에 별도로 안내드립니다. 안내를 못받으셨다면 조인하와이 현지 연락처로 연락주시기 바랍니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>본 바우처를 준비하여 가시기 바랍니다. 미 지참시 투어 참여/환불 불가합니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>가이드팁 1인당 $10, 점심 팁 1인당 $3 별도로 준비하여 주시기 바랍니다.</strong></span></p></li><li><p>겉옷 지참 부탁드립니다.</p></li><li><p>픽업시간 보다 10분 일찍 픽업장소에서 대기하여 주시기 바랍니다.</p></li><li><p>픽업시간이 5분 정도 지연될 경우 픽업장소를 이탈하지 마시고, 조인하와이 현지 연락처로 연락주시기 바랍니다.</p></li><li><p>픽업시간 지연 시 연락을 주시지 않아 픽업이 안되었을 경우 취소 및 환불이 불가합니다.</p></li><li><p>픽업시간 불이행으로 인한 행사 불참 시에는 별도의 연락은 드리지 않습니다.</p></li><li><p>멀미약은 필요 시 개별적으로 사전 복용 하셔야 하며, 멀미로 인한 환불은 불가합니다.</p></li></ul>'
    },
    {
      value: '[일일관광]마우이 일일관광',
      label: '[일일관광]마우이 일일관광',
      en_label: 'ONE DAY MAUI TOUR',
      ...ONE_DAY_TOUR
    },
    {
      value: '[일일관광]카우아이 일일관광',
      label: '[일일관광]카우아이 일일관광',
      en_label: 'ONE DAY KAUAI TOUR',
      ...ONE_DAY_TOUR
    }
  ],
  해양스포츠: [
    { value: '돌핀 앤 유', label: '돌핀 앤 유', en_label: 'DOLPHIN AND YOU' },
    {
      value: '(마우이) 몰로키니 스노클링 - 칼립소',
      label: '(마우이) 몰로키니 스노클링 - 칼립소',
      en_label: 'MAUI MOLOKINI SNORKELING CALYPSO',
      arrival_location:
        '<p><strong>[체크인 장소 위치]</strong></p><p>Calypso, Slip 76 - 78 South Ferry Dock, 101 Maalaea Rd, Wailuku, HI 96793</p><p>주차 후 바다 맨 끝쪽에 위치한 <span style="color: rgb(59, 130, 246);"><strong>Slip 76</strong></span></p><p>배에 <span style="color: rgb(59, 130, 246);"><strong>Calypso</strong></span>라고 적혀있는 곳에서 체크인 해주시면 됩니다. (사진 참고)</p><p></p><p><strong>[주차 안내]</strong></p><p>Maalaea Harbor 항구 바닷가쪽 또는 Maui Ocean Center 주차장에 주차하시면 됩니다.<span style="color: rgb(23, 23, 23);"> <strong>(유료)</strong></span></p><p>(Maui Ocean Center 주소 : 300 Maalaea Road, Wailuku HI 96793)</p><p>표지판의 지시에 따라 QR 코드나 휴대폰 문자 메시지를 통해 결제하시고</p><p>결제를 완료할 수 없는 경우 주차장 직원을 찾아 직접 문의/결제하시기 바랍니다.</p><p><span style="color: rgb(239, 68, 68);"><strong>미리 약 7시간 정도로 여유있게 주차비용 확인하신 후 지불하시기 바랍니다.</strong></span></p><p><span style="color: rgb(239, 68, 68);"><strong>주차 요금을 미리 지불하지 않으시면 벌금이 부과되거나 차량이 견인될 수 있습니다.</strong></span></p><p>비용 포함한 주차장 관련 사항은 현지 사정에 의해 예고없이 변동될 수 있어 사전 확인이 어렵습니다.</p><p><span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/65a56921-5ee2-4efc-ae9b-552d58427730.png" alt="몰로키니.png" title="" width="null" height="null" style="max-width: nullpx" data-keep-ratio="true" class=""></span></span></p>',
      delivery_notes:
        '<ul><li><p>투어 참여하시는 <span style="color: rgb(239, 68, 68);"><strong>모든 분들은</strong></span><strong> 스노클링 업체에서 제공하는 위 링크 </strong><span style="color: rgb(239, 68, 68);"><strong>면책 동의서를 제출</strong></span>하셔야 참여 가능합니다.</p></li><li><p>동의서는 미리 등록하셔도 되고, 늦어도 체크인 하시기 전까지 제출하셔야 합니다. (미제출 시 투어 참여, 환불 불가)</p></li></ul>',
      guide_notes:
        '<ul><li><p>본 바우처를 출력 또는 캡쳐하여 가져가시기 바랍니다. 바우처 미 지참시 진행이 불가합니다.</p></li><li><p>체크인 시간(06:45AM)에 늦지 않게 도착하시기 바랍니다. // 출항 약 07:30AM ~ 귀항 약 12:30PM</p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>알코올 음료는 실물 여권 지참하셔야 하며 개별 결제 후 이용 가능합니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>수영복(옷 안에 미리 착용), 비치타올, 선크림, 여벌 옷 등 개인 물품을 준비하여 가시기 바랍니다.</strong></span></p></li><li><p>조식 : 머핀&amp;과일 // 중식 : 터키샌드위치 또는 돼지고기 샌드위치 선택 (메뉴는 업체사정에 의해 변경될 수 있습니다.)</p></li><li><p>체크인 시간 불이행으로 인한 행사 불참 시 별도의 연락없이 진행되며 전액 환불 불가합니다.</p></li><li><p>자연에 서식하는 해양동물을 만나지 못하는 경우 환불 및 보상은 불가합니다.</p></li><li><p>멀미약은 필요 시 개별적으로 사전 복용 하셔야 하며, 멀미로 인한 환불은 불가합니다.</p></li><li><p>주차비 포함한 주차장 관련 사항은 현지 사정에 의해 예고없이 변동될 수 있어 사전 확인이 어렵습니다.</p></li><li><p>주차 요금을 미리 지불하지 않으시면 벌금이 부과되거나 차량이 견인될 수 있습니다.</p></li><li><p>투어 참여하시는 모든 분들은 위에 기재해드린 링크에서 면책 동의서 등록하셔야 참여 가능합니다. (미제출 시 투어 참여, 환불 불가)</p></li></ul>'
    },
    {
      value: '(빅아일랜드) 코나 만타레이 선셋 스노클링',
      label: '(빅아일랜드) 코나 만타레이 선셋 스노클링',
      en_label: 'KONA MANTARAY SNOKELING',
      arrival_location:
        '<p><span style="font-size: 12px; color: rgb(59, 130, 246);"><strong>IRUKA </strong></span><span style="font-size: 12px;"><strong>라고 써 있는 곳에서 체크인 하시면 됩니다.</strong></span></p><p><span style="font-size: 12px;"><strong>[주소] Slip A-17, 74-380 Kealakehe Pkwy, Kailua-Kona, HI 96740</strong></span></p><p><span style="font-size: 12px;"><strong>구글맵 검색 : Iruka Hawaii Dolphin and Manta Tours</strong></span></p><p></p><p><span style="font-size: 12px;">하와이 익스피리언스 가는 길 참고 영상 : </span><a target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 underline" href="https://youtu.be/h8RU5Hlmu4E"><span style="font-size: 12px;">https://youtu.be/h8RU5Hlmu4E</span></a></p><p><span style="font-size: 12px;">1. 지도에서 HONOKOHAU HARBOR를 검색하십시오.</span></p><p><span style="font-size: 12px;">2. Hwy 19 Queen Kaahumanu Hwy -"HONOKOHAU MARINA"라는 표지판이 보입니다.</span></p><p><span style="font-size: 12px;">3. Keakakehe Pkwy를 내려와 첫 번째길에서 우회전 - 약 0.4마일</span></p><p><span style="font-size: 12px;">4. 두 개의 노란색 기둥( 사진 참조)을 지나갈 때까지 항구까지 길을 따라 운전하십시오. 체크인 지점이 있습니다!</span></p><p><span style="font-size: 12px;">※ 현 시점 무료로 주차 가능하나 이는 예고없이 변경될 수 있습니다.</span></p><p><span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/cc1d0541-db75-44c8-8c18-9ea0c65ae295.png" alt="만타1.png" title="" width="468.35418701171875" height="219.33942536883333" style="max-width: 468.35418701171875px" data-keep-ratio="true" class=""></span></span><span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/baf89647-e037-4404-9e95-37a3da958333.png" alt="만타2.png" title="" width="468.3680725097656" height="248.87381107047278" style="max-width: 468.3680725097656px" data-keep-ratio="true" class=""></span></span></p>',
      delivery_notes:
        '<ul><li><p><span style="font-size: 12px;">투어 참여하시는 <strong>모든 분들은 스노클링 업체에서 제공하는 위 링크 </strong></span><span style="font-size: 12px; color: rgb(239, 68, 68);"><strong>면책 동의서를 제출</strong></span><span style="font-size: 12px;">하셔야 참여 가능합니다.</span></p></li><li><p><span style="font-size: 12px;">동의서는 미리 등록하셔도 되고, 늦어도 체크인 하시기 전까지 제출하셔야 합니다. (미제출 시 투어 참여, 환불 불가)</span></p></li></ul>',
      guide_notes:
        '<ul><li><p><span style="font-size: 12px; color: rgb(59, 130, 246);"><strong>본 바우처를 출력 또는 캡쳐하여 가져가시기 바랍니다. 바우처 미 지참시 진행이 불가합니다.</strong></span></p></li><li><p><span style="font-size: 12px;">체크인 시간보다 최소 10분 일찍 도착하시는 것을 권장드립니다.</span></p></li><li><p><span style="font-size: 12px;">알코올 음료는 실물 여권 지참하셔야 드실 수 있습니다.</span></p></li><li><p><span style="font-size: 12px; color: rgb(59, 130, 246);"><strong>수영복(옷 안에 미리 착용), 비치타올 (큰 사이즈 권장), 모자, 선글라스, 선크림, 여벌 옷(긴팔 등) 등 개인 물품을 준비하여 가시기 바랍니다.</strong></span></p></li><li><p><span style="font-size: 12px;">웻수트(잠수복)은 $10/인 결제 후 대여 가능합니다.</span></p></li><li><p><span style="font-size: 12px;">웻수트 대여 시 개인 수영복 착용하신 후 그 위에 웻수트 착용하셔야 합니다.</span></p></li><li><p><span style="font-size: 12px;">멀미약은 필요 시 개별적으로 사전 복용 하셔야 하며, 멀미로 인한 환불은 불가합니다.</span></p></li><li><p><span style="font-size: 12px;">투어 포함 사항 : 스노클링 세트, 안전조끼 대여, 간단한 스낵 (물, 핫초코, 에너지바)</span></p></li><li><p><span style="font-size: 12px;">체크인 시간 불이행으로 인한 행사 불참 시 별도의 연락없이 진행되며 전액 환불 불가합니다.</span></p></li><li><p><span style="font-size: 12px;">투어 참여하시는 모든 분들은 기재된 링크의 면책 동의서 작성하셔야 참여 가능합니다. (미제출 시 투어 참여, 환불 불가)</span></p></li><li><p><span style="font-size: 12px;">자연에 서식하는 해양동물을 만나지 못하는 경우 환불 및 보상은 불가합니다.</span></p></li><li><p><span style="font-size: 12px;">스노클링 업체에서 자체적으로 사진/영상을 촬영하여 무료로 제공해 드립니다. (투어 당일 이후 제공 불가) (투어 종료 후 직원 안내받으시고 촬영본 수령하실 개인 메일을 전달하셔야 합니다.) 다만 투어 당일 촬영이 어려울 경우 별도 고지 없이 촬영본은 제공해 드리지 않으며 이로 인한 취소/환불은 어렵습니다.</span></p></li><li><p><span style="font-size: 12px; color: rgb(59, 130, 246);"><strong>투어에 만족하셨다면 현장 스탭에게 매너팁($10/인) 주시는걸 권장드립니다.</strong></span></p></li></ul>'
    },
    {
      value: '[카네오헤 샌드바 어드밴처]스탠다드',
      label: '[카네오헤 샌드바 어드밴처]스탠다드',
      en_label: 'KANEOHE SANDBAR ADVENTURE STANDARD',
      ...KANEOHE_SANDBAR_ADVENTURE
    },
    {
      value: '[카네오헤 샌드바 어드밴처]디럭스',
      label: '[카네오헤 샌드바 어드밴처]디럭스',
      en_label: 'KANEOHE SANDBAR ADVENTURE DELUXE',
      ...KANEOHE_SANDBAR_ADVENTURE
    },
    {
      value: '[하나우마베이 스노클링]디럭스 스탠다드',
      label: '[하나우마베이 스노클링]디럭스 스탠다드',
      en_label: 'HANAUMA BAY SNORKELING STANDARD',
      confirmation_number: 'LEE',
      arrival_location:
        '<p>쉐라톤 와이키키 호텔 - 고객 전용 주차장 건물 입구 Donho Lane (돈호레인)</p><p></p><p><span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/e0f80ccb-6c1c-432e-a4e9-f613d2c002da.jpg" alt="SHERATON WAIKIKI 호텔 - 고객 전용 주차장 건물 입구 Donho Lane (돈호레인) 1.jpg" title="" width="467.36810302734375" height="288.07832107521386" style="max-width: 467.36810302734375px" data-keep-ratio="true" class=""></span></span></p>',
      delivery_notes:
        '<ul><li><p><span style="color: rgb(59, 130, 246);"><strong>투어 하루 전날</strong></span> 오후 5시까지 <span style="color: rgb(59, 130, 246);"><strong>카카오톡으로 정확한 픽업 시간 안내</strong></span>드립니다.</p></li><li><p>카카오톡 설정 - 친구 카테고리에서 <span style="color: rgb(239, 68, 68);"><strong>\'전화번호로 친구 추가 허용\'을 활성화</strong></span> 해주시기 바랍니다.</p></li><li><p>17시까지 카톡을 못 받으셨을 경우<span style="color: rgb(59, 130, 246);"><strong> 현지 연락처로 먼저 연락</strong></span> 부탁드립니다.(카톡ID : joinhawaiiusa / 연락처 : 1-808-772-2691 )</p></li></ul>',
      guide_notes:
        '<ul><li><p><span style="color: rgb(59, 130, 246);"><strong>본 바우처 캡쳐본과 예약 대표자분의 여권 실물 지참하셔야 투어 참여 가능합니다.</strong></span></p></li><li><p>하나우마베이 입장 시 직원이 예약 대표자분의 여권 실물 확인합니다.</p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>픽업시간은 투어 전 날 오후 5시 이전에 별도로 안내드립니다.</strong></span></p></li><li><p>카카오톡 설정 - 친구 카테고리에서<span style="color: rgb(59, 130, 246);"><strong> \'전화번호로 친구 추가 허용\'을 활성화</strong></span> 해주시기 바랍니다.</p></li><li><p>안내를 못받으셨다면 반드시 아래 조인하와이 현지 연락처로 연락주시기 바랍니다.</p></li><li><p><span style="color: rgb(239, 68, 68);"><strong>연락을 안주셔서 투어 미팅 시간을 안내 못받으셨을 경우 투어 참여/환불이 불가합니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>하나우마베이 성인(만13세이상) 입장료 $25/인 현장 결제를 위해 현금 지참해주시기 바랍니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>하나우마베이 입장권, 그늘막, 생수가 포함되어 있습니다.</strong></span></p></li><li><p>사전 예약한 만 3세 미만 소아는 무료이나 그늘막, 생수, 차량 좌석 등 제공품은 없습니다. (보호자 무릎에 착석)</p></li><li><p>개인 부주의로 인한 대여품 분실 또는 파손 시 보상 비용이 별도 청구됩니다.</p></li><li><p>차량이 협소하여 비치체어와 파라솔은 지참하실 수 없습니다. 제공해드리는 그늘막을 사용해주시기 바랍니다.</p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>간식은 필요 시 개별 지참하시기 바랍니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>스노클링 장비, 수영복, 비치타올, 선크림, 여벌옷 등 개인물품을 준비하여 주시기 바랍니다. 최소한으로 준비해주시기 바랍니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>수영복은 미리 옷 안에 입고오시는게 좋습니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>옷을 갈아 입으셔야 할 경우에는 하나우마베이에 있는 화장실(탈의실)에서 갈아입으시면 됩니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>짐이 많을 경우 하나우마베이 안에 있는 유료 락커에 보관하시기 바랍니다. (락커 모두 사용중일 경우 이용 불가)</strong></span></p></li><li><p>환경보호를 위해 Non-Nano, 미네랄 선스크린, 리프 세이프(Reef Safe) 종류의 선크림만 사용 가능합니다.</p></li><li><p>픽업시간 보다 5~10분 일찍 픽업장소에서 대기하여 주시기 바랍니다.</p></li><li><p>픽업시간이 5분 정도 지연될 경우 픽업장소를 이탈하지 마시고, 조인하와이 데스크로 연락주시기 바랍니다.</p></li><li><p>픽업시간 지연 시 연락을 주시지 않아 픽업이 안되었을 경우 취소 및 환불이 불가합니다.</p></li><li><p>픽업시간 불이행으로 인한 행사 불참 시에는 별도의 연락은 드리지 않으며, 전액 환불 불가합니다.</p></li><li><p>비치에 설치되어 있는 간이 샤워시설에서 물로만 샤워 가능합니다. (비누, 샴푸 등 사용 불가)</p></li><li><p>바우처에 기재된 장소를 모르실 경우 조인하와이 현지 연락처로 문의하여 안내 받으시기 바랍니다.</p></li><li><p>현지 사정으로 인해 투어 일정이 예고없이 변경되거나 취소될 수 있습니다.</p></li><li><p>자연에 서식하는 해양동물을 만나지 못하는 경우 환불 및 보상은 불가합니다.</p></li><li><p>조인하와이는 하나우마베이 입장권 구입 대행과 교통편 등만을 제공하며, 하나우마베이 내에서의 자유시간에 대해서는 책임지지 않습니다. 하나우마베이 내에서는 하나우마베이 자체 규칙을 따라야 하며, 이를 위반하거나 부주의로 인한 안전사고는 책임지지 않습니다.</p></li></ul>'
    },
    {
      value: '[하나우마베이 스노클링]디럭스 프리미엄',
      label: '[하나우마베이 스노클링]디럭스 프리미엄',
      en_label: 'HANAUMA BAY SNORKELING PREMIUM',
      confirmation_number: 'LEE',
      arrival_location:
        '<p>쉐라톤 와이키키 호텔 - 고객 전용 주차장 건물 입구 Donho Lane (돈호레인)</p><p></p><p><span class="node-image"><span class="image-component"><img src="https://hpwrnhxgnawyfmhwqqsm.supabase.co/storage/v1/object/public/location-images/reservations/20260529-JH001/location/e0f80ccb-6c1c-432e-a4e9-f613d2c002da.jpg" alt="SHERATON WAIKIKI 호텔 - 고객 전용 주차장 건물 입구 Donho Lane (돈호레인) 1.jpg" title="" width="467.36810302734375" height="288.07832107521386" style="max-width: 467.36810302734375px" data-keep-ratio="true" class=""></span></span></p>',
      delivery_notes:
        '<ul><li><p><span style="color: rgb(59, 130, 246);"><strong>투어 전날</strong></span> 오후 5시까지 <span style="color: rgb(59, 130, 246);"><strong>카카오톡으로 정확한 픽업 시간 안내</strong></span>드립니다.</p></li><li><p>카카오톡 설정 - 친구 카테고리에서 <span style="color: rgb(239, 68, 68);"><strong>\'전화번호로 친구 추가 허용\'을 활성화</strong></span> 해주시기 바랍니다.</p></li><li><p>오후 5시까지 카톡을 못 받으셨을 경우 <span style="color: rgb(59, 130, 246);"><strong>현지 연락처로 먼저 연락</strong></span> 부탁드립니다. (카톡ID : joinhawaiiusa / 연락처 : 1-808-772-2691 )</p></li></ul>',
      guide_notes:
        '<ul><li><p><span style="color: rgb(59, 130, 246);"><strong>본 바우처 캡쳐본과 예약 대표자분의 여권 실물 지참하셔야 투어 참여 가능합니다.</strong></span></p></li><li><p>하나우마베이 입장 시 직원이 예약 대표자분의 여권 실물 확인합니다.</p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>픽업시간은 투어 전 날 오후 5시 이전에 카카오톡으로 안내드립니다.</strong></span></p></li><li><p>카카오톡 설정 - 친구 카테고리에서<span style="color: rgb(59, 130, 246);"><strong> \'전화번호로 친구 추가 허용\'</strong></span>을 활성화 해주시기 바랍니다.</p></li><li><p>안내를 못받으셨다면 반드시 아래 조인하와이 현지 연락처로 연락주시기 바랍니다.</p></li><li><p><span style="color: rgb(239, 68, 68);"><strong>연락이 안되어 투어 미팅 시간을 안내 못받으셨을 경우 투어 참여/환불이 불가합니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>하나우마베이 성인(만13세이상) 입장료 $25/인 현장 결제를 위해 현금 지참해주시기 바랍니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>하나우마베이 입장권, 스노클링 장비(스노클링 고글, 구명벨트, 오리발), 그늘막, 생수가 포함되어 있습니다.</strong></span></p></li><li><p>프리미엄 옵션 예약 시 소아의 스노클링 장비는 스노클링용 고글,스트로우와 구명조끼만 제공됩니다.</p></li><li><p>사전 예약한 만 3세 미만 소아는 무료이나 장비, 차량 좌석 등 제공품은 없습니다. (보호자 무릎에 착석)</p></li><li><p>!! 성인은 구명 조끼 대신 스노클링에 용이한 구명 벨트로 제공됩니다.!!</p></li><li><p>차량이 협소하여 비치체어와 파라솔은 지참하실 수 없습니다. 제공해드리는 그늘막을 사용해주시기 바랍니다.</p></li><li><p>개인 부주의로 인한 대여품 분실 또는 파손 시 보상 비용이 별도 청구됩니다.</p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>간식은 필요 시 개별 지참하시기 바랍니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>수영복, 비치타올, 선크림, 여벌옷 등 개인물품을 준비하여 주시기 바랍니다. 최소한으로 준비해주시기 바랍니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>수영복은 미리 옷 안에 입고오시는게 좋습니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>옷을 갈아 입으셔야 할 경우에는 하나우마베이에 있는 화장실(탈의실)에서 갈아입으시면 됩니다.</strong></span></p></li><li><p><span style="color: rgb(59, 130, 246);"><strong>짐이 많을 경우 하나우마베이 안에 있는 유료 락커에 보관하시기 바랍니다. (락커 모두 사용중일 경우 이용 불가)</strong></span></p></li><li><p>환경보호를 위해 Non-Nano, 미네랄 선스크린, 리프 세이프(Reef Safe) 종류의 선크림만 사용 가능합니다.</p></li><li><p>픽업시간 보다 5~10분 일찍 픽업장소에서 대기하여 주시기 바랍니다.</p></li><li><p>픽업시간이 5분 정도 지연될 경우 픽업장소를 이탈하지 마시고, 조인하와이(하와이 현지)로 연락주시기 바랍니다.</p></li><li><p>픽업시간 지연 시 연락을 주시지 않아 픽업이 안되었을 경우 취소 및 환불이 불가합니다.</p></li><li><p>픽업시간 불이행으로 인한 행사 불참 시에는 별도의 연락은 드리지 않으며, 전액 환불 불가합니다.</p></li><li><p>비치에 설치되어 있는 간이 샤워시설에서 물로만 샤워 가능합니다. (비누, 샴푸 등 사용 불가)</p></li><li><p>바우처에 기재된 장소를 모르실 경우 조인하와이 현지 연락처로 문의하여 안내 받으시기 바랍니다.</p></li><li><p>현지 사정으로 인해 투어 일정이 예고없이 변경되거나 취소될 수 있습니다.</p></li><li><p>자연에 서식하는 해양동물을 만나지 못하는 경우 환불 및 보상은 불가합니다.</p></li><li><p>조인하와이는 하나우마베이 입장권 예약 대행과 교통편 등만을 제공하며, 하나우마베이 내에서의 자유시간에 대해서는 책임지지 않습니다.</p></li><li><p>하나우마베이 내에서는 하나우마베이 자체 규칙을 따라야 하며, 이를 위반하거나 부주의로 인한 안전사고는 책임지지 않습니다.</p></li></ul>'
    },
    {
      value: '[하나우마베이 스노클링]얼리버드',
      label: '[하나우마베이 스노클링]얼리버드',
      en_label: 'HANAUMA BAY SNORKELING EARLY BIRD'
    },
    {
      value: '[하와이 서핑]소그룹 2~3인',
      label: '[하와이 서핑]소그룹 2~3인',
      en_label: 'HAWAII SURFING 2~3PAX',
      ...HAWAII_SURFING
    },
    {
      value: '[하와이 서핑]프라이빗 1인',
      label: '[하와이 서핑]프라이빗 1인',
      en_label: 'HAWAII SURFING PRIVATE 1PAX',
      ...HAWAII_SURFING
    },
    {
      value: '[하와이 서핑]라이더',
      label: '[하와이 서핑]라이더',
      en_label: 'HAWAII SURFING RIDER',
      ...HAWAII_SURFING
    },
    {
      value: '혹등고래 관찰 크루즈',
      label: '혹등고래 관찰 크루즈',
      en_label: 'WHALE WATCHING CRUISES'
    }
  ],
  액티비티: [
    {
      value: '[무동력 글라이더]시닉 라이더 15분 1인탑승',
      label: '[무동력 글라이더]시닉 라이더 15분 1인탑승',
      en_label: 'GLIDER SENIC RIDERS 15MIN 1PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 15분 2인탑승',
      label: '[무동력 글라이더]시닉 라이더 15분 2인탑승',
      en_label: 'GLIDER SENIC RIDERS 15MIN 2PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 20분 1인탑승',
      label: '[무동력 글라이더]시닉 라이더 20분 1인탑승',
      en_label: 'GLIDER SENIC RIDERS 20MIN 1PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 20분 2인탑승',
      label: '[무동력 글라이더]시닉 라이더 20분 2인탑승',
      en_label: 'GLIDER SENIC RIDERS 20MIN 2PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 30분 1인탑승',
      label: '[무동력 글라이더]시닉 라이더 30분 1인탑승',
      en_label: 'GLIDER SENIC RIDERS 30MIN 1PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 30분 2인탑승',
      label: '[무동력 글라이더]시닉 라이더 30분 2인탑승',
      en_label: 'GLIDER SENIC RIDERS 30MIN 2PAX'
    },
    {
      value: '[무동력 글라이더]에어로바틱 라이더 15분 1인탑승',
      label: '[무동력 글라이더]에어로바틱 라이더 15분 1인탑승',
      en_label: 'GLIDER AEROBATIC RIDER 15MIN 1PAX'
    },
    {
      value: '[무동력 글라이더]에어로바틱 라이더 20분 1인탑승',
      label: '[무동력 글라이더]에어로바틱 라이더 20분 1인탑승',
      en_label: 'GLIDER AEROBATIC RIDER 20MIN 2PAX'
    },
    {
      value: '[블루 하와이안 헬기투어]오아후 BLUE SKIES OF OAHU',
      label: '[블루 하와이안 헬기투어]오아후 BLUE SKIES OF OAHU',
      en_label: 'OAHU BLUE HAWAIIAN HELICOPTER BLUE SKIES OF OAHU'
    },
    {
      value: '[블루 하와이안 헬기투어]오아후 COMPLETE ISLAND',
      label: '[블루 하와이안 헬기투어]오아후 COMPLETE ISLAND',
      en_label: 'OAHU BLUE HAWAIIAN HELICOPTER COMPLETE ISLAND'
    },
    {
      value: '[블루 하와이안 헬기투어]오아후 TURTLE BAY OAHU AIR ADVENTURE',
      label: '[블루 하와이안 헬기투어]오아후 TURTLE BAY OAHU AIR ADVENTURE',
      en_label: 'OAHU BLUE HAWAIIAN HELICOPTER TURTLE BAY OAHU AIR ADVENTURE'
    },
    {
      value: '[블루 하와이안 헬기투어]오아후 TURTLE BAY DISCOVER NORTH SHORE',
      label: '[블루 하와이안 헬기투어]오아후 TURTLE BAY DISCOVER NORTH SHORE',
      en_label: 'OAHU BLUE HAWAIIAN HELICOPTER TURTLE BAY DISCOVER NORTH SHORE'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 DISCOVER HILO',
      label: '[블루 하와이안 헬기투어]빅아일랜드 DISCOVER HILO',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELICOPTER DISCOVER HILO'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 HILO WATERFALL EXPERIENCE',
      label: '[블루 하와이안 헬기투어]빅아일랜드 HILO WATERFALL EXPERIENCE',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELICOPTER HILO WATERFALL EXPERIENCE'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA BIG ISLAND SPECTACULAR',
      label: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA BIG ISLAND SPECTACULAR',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELICOPTER WAIKOLOA BIG ISLAND SPECTACULAR'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA KOHALA COAST ADVENTURE',
      label: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA KOHALA COAST ADVENTURE',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELICOPTER WAIKOLOA KOHALA COAST ADVENTURE'
    },
    {
      value: '[블루 하와이안 헬기투어]마우이 HANA RAINFOREST',
      label: '[블루 하와이안 헬기투어]마우이 HANA RAINFOREST',
      en_label: 'MAUI BLUE HAWAIIAN HELICOPTER HANA RAINFOREST'
    },
    {
      value: '[블루 하와이안 헬기투어]마우이 MAJESTIC MAUI',
      label: '[블루 하와이안 헬기투어]마우이 MAJESTIC MAUI',
      en_label: 'MAUI BLUE HAWAIIAN HELICOPTER MAJESTIC MAUI'
    },
    {
      value: '[블루 하와이안 헬기투어]마우이 WEST MAUI AND MOLOKAI',
      label: '[블루 하와이안 헬기투어]마우이 WEST MAUI AND MOLOKAI',
      en_label: 'MAUI BLUE HAWAIIAN HELICOPTER WEST MAUI AND MOLOKAI'
    },
    {
      value: '[블루 하와이안 헬기투어]마우이 MAUI & MOLOKAI SPECTACULAR',
      label: '[블루 하와이안 헬기투어]마우이 MAUI & MOLOKAI SPECTACULAR',
      en_label: 'MAUI BLUE HAWAIIAN HELICOPTER MAUI & MOLOKAI SPECTACULAR'
    },
    {
      value: '[블루 하와이안 헬기투어]카우아이 ECO ADVENTURE',
      label: '[블루 하와이안 헬기투어]카우아이 ECO ADVENTURE',
      en_label: 'KAUAI BLUE HAWAIIAN HELICOPTER ECO ADVENTURE'
    },
    {
      value: '[블루 하와이안 헬기투어]카우아이 DISCOVER KAUAI',
      label: '[블루 하와이안 헬기투어]카우아이 DISCOVER KAUAI',
      en_label: 'KAUAI BLUE HAWAIIAN HELICOPTER DISCOVER KAUAI'
    },
    {
      value: '[쿠알로아랜치]UTV 랩터 어드벤처 2시간 픽업불포함',
      label: '[쿠알로아랜치]UTV 랩터 어드벤처 2시간 픽업불포함',
      en_label: 'KUALOA RANCH UTV RAPTOR ADVENTURE 2H NO PICKUP',
      ...KUALOA_RANCH_UTV_RAPTOR_ADVENTURE_NO_PICKUP
    },
    {
      value: '[쿠알로아랜치]UTV 랩터 어드벤처 2시간 픽업포함',
      label: '[쿠알로아랜치]UTV 랩터 어드벤처 2시간 픽업포함',
      en_label: 'KUALOA RANCH UTV RAPTOR ADVENTURE 2H PICKUP',
      ...KUALOA_RANCH_UTV_RAPTOR_ADVENTURE_PICKUP
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업불포함',
      label: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업불포함',
      en_label: 'KUALOA RANCH UTV RIDE ALONG ADVENTURE 2H NO PICKUP',
      ...KUALOA_RANCH_UTV_RIDE_ALONG_ADVENTURE_NO_PICKUP
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업포함',
      label: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업포함',
      en_label: 'KUALOA RANCH UTV RIDE ALONG ADVENTURE 2H PICKUP',
      ...KUALOA_RANCH_UTV_RIDE_ALONG_ADVENTURE_PICKUP
    },
    {
      value: '[쿠알로아랜치]UTV 랩터 어드벤처 3시간 픽업불포함',
      label: '[쿠알로아랜치]UTV 랩터 어드벤처 3시간 픽업불포함',
      en_label: 'KUALOA RANCH UTV RAPTOR ADVENTURE 3H NO PICKUP',
      ...KUALOA_RANCH_UTV_RAPTOR_ADVENTURE_NO_PICKUP
    },
    {
      value: '[쿠알로아랜치]UTV 랩터 어드벤처 3시간 픽업포함',
      label: '[쿠알로아랜치]UTV 랩터 어드벤처 3시간 픽업포함',
      en_label: 'KUALOA RANCH UTV RAPTOR ADVENTURE 3H PICKUP',
      ...KUALOA_RANCH_UTV_RAPTOR_ADVENTURE_PICKUP
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 3시간 가이드운전 픽업불포함',
      label: '[쿠알로아랜치]UTV 어드벤처 3시간 가이드운전 픽업불포함',
      en_label: 'KUALOA RANCH UTV ADVENTURE 3H NO PICKUP',
      ...KUALOA_RANCH_UTV_RIDE_ALONG_ADVENTURE_NO_PICKUP
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 3시간 가이드운전 픽업포함',
      label: '[쿠알로아랜치]UTV 어드벤처 3시간 가이드운전 픽업포함',
      en_label: 'KUALOA RANCH UTV ADVENTURE 3H PICKUP',
      ...KUALOA_RANCH_UTV_RIDE_ALONG_ADVENTURE_PICKUP
    },
    {
      value: '[쿠알로아랜치]무비사이트 픽업불포함',
      label: '[쿠알로아랜치]무비사이트 픽업불포함',
      en_label: 'KUALOA RANCH MOVIE SITE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]무비사이트 픽업포함',
      label: '[쿠알로아랜치]무비사이트 픽업포함',
      en_label: 'KUALOA RANCH MOVIE SITE PICKUP'
    },
    {
      value: '[쿠알로아랜치]씨크릿 아일랜드 비치 어드벤처 픽업불포함',
      label: '[쿠알로아랜치]씨크릿 아일랜드 비치 어드벤처 픽업불포함',
      en_label: 'KUALOA RANCH SECRET ISLAND BEACH ADVENTURE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]씨크릿 아일랜드 비치 어드벤처 픽업포함',
      label: '[쿠알로아랜치]씨크릿 아일랜드 비치 어드벤처 픽업포함',
      en_label: 'KUALOA RANCH SECRET ISLAND BEACH ADVENTURE PICKUP'
    },
    {
      value: '[쿠알로아랜치]오션보야지 픽업불포함',
      label: '[쿠알로아랜치]오션보야지 픽업불포함',
      en_label: 'KUALOA RANCH OCEAN VOYAGE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]오션보야지 픽업포함',
      label: '[쿠알로아랜치]오션보야지 픽업포함',
      en_label: 'KUALOA RANCH OCEAN VOYAGE PICKUP'
    },
    {
      value: '[쿠알로아랜치]익스피리언스 패키지 픽업불포함',
      label: '[쿠알로아랜치]익스피리언스 패키지 픽업불포함',
      en_label: 'BEST OF KUALOA EXPERIENCE PACKAGE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]익스피리언스 패키지 픽업포함',
      label: '[쿠알로아랜치]익스피리언스 패키지 픽업포함',
      en_label: 'BEST OF KUALOA EXPERIENCE PACKAGE PICKUP'
    },
    {
      value: '[쿠알로아랜치]전기 산악바이크 투어 픽업불포함',
      label: '[쿠알로아랜치]전기 산악바이크 투어 픽업불포함',
      en_label: 'KUALOA RANCH ELECTRIC MOUNTAIN BIKE TOUR NO PICKUP',
      ...KUALOA_RANCH_ELECTRIC_MOUNTAIN_BIKE_TOUR_NO_PICKUP
    },
    {
      value: '[쿠알로아랜치]전기 산악바이크 투어 픽업포함',
      label: '[쿠알로아랜치]전기 산악바이크 투어 픽업포함',
      en_label: 'KUALOA RANCH ELECTRIC MOUNTAIN BIKE TOUR PICKUP',
      ...KUALOA_RANCH_ELECTRIC_MOUNTAIN_BIKE_TOUR_PICKUP
    },
    {
      value: '[쿠알로아랜치]정글투어 픽업불포함',
      label: '[쿠알로아랜치]정글투어 픽업불포함',
      en_label: 'KUALOA RANCH JUNGLE EXPEDITION NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]정글투어 픽업포함',
      label: '[쿠알로아랜치]정글투어 픽업포함',
      en_label: 'KUALOA RANCH JUNGLE EXPEDITION PICKUP'
    },
    {
      value: '[쿠알로아랜치]쥬라기 어드벤처 투어 픽업불포함',
      label: '[쿠알로아랜치]쥬라기 어드벤처 투어 픽업불포함',
      en_label: 'KUALOA RANCH JURASSIC ADVENTURE TOUR NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]쥬라기 어드벤처 투어 픽업포함',
      label: '[쿠알로아랜치]쥬라기 어드벤처 투어 픽업포함',
      en_label: 'KUALOA RANCH JURASSIC ADVENTURE TOUR PICKUP'
    },
    {
      value: '[쿠알로아랜치]쥬라기계곡 집라인 투어 픽업불포함',
      label: '[쿠알로아랜치]쥬라기계곡 집라인 투어 픽업불포함',
      en_label: 'KUALOA RANCH JURASSIC VALLEY ZIPLINE TOUR NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]쥬라기계곡 집라인 투어 픽업포함',
      label: '[쿠알로아랜치]쥬라기계곡 집라인 투어 픽업포함',
      en_label: 'KUALOA RANCH JURASSIC VALLEY ZIPLINE TOUR PICKUP'
    },
    {
      value: '[쿠알로아랜치]쿠알로아 하프데이 패키지 픽업불포함',
      label: '[쿠알로아랜치]쿠알로아 하프데이 패키지 픽업불포함',
      en_label: 'KUALOA HALF DAY PACKAGE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]쿠알로아 하프데이 패키지 픽업포함',
      label: '[쿠알로아랜치]쿠알로아 하프데이 패키지 픽업포함',
      en_label: 'KUALOA HALF DAY PACKAGE PICKUP'
    }
  ],
  스냅: [
    {
      value: '[하와이 스냅]와이키키 커플스냅 30분',
      label: '[하와이 스냅]와이키키 커플스냅 30분',
      en_label: 'HAWAII SNAP WAIKIKI COUPLE 30MIN',
      ...HAWAII_SNAP
    },
    {
      value: '[하와이 스냅]와이키키 커플스냅 1시간',
      label: '[하와이 스냅]와이키키 커플스냅 1시간',
      en_label: 'HAWAII SNAP WAIKIKI COUPLE 60MIN',
      ...HAWAII_SNAP
    },
    {
      value: '[하와이 스냅]와이키키 가족스냅 30분',
      label: '[하와이 스냅]와이키키 가족스냅 30분',
      en_label: 'HAWAII SNAP WAIKIKI FAMILY 30MIN',
      ...HAWAII_SNAP
    },
    {
      value: '[하와이 스냅]와이키키 가족스냅 1시간',
      label: '[하와이 스냅]와이키키 가족스냅 1시간',
      en_label: 'HAWAII SNAP WAIKIKI FAMILY 60MIN',
      ...HAWAII_SNAP
    },
    {
      value: '[하와이 스냅]비치선셋 1시간',
      label: '[하와이 스냅]비치선셋 1시간',
      en_label: 'HAWAII SNAP BEACH SUNSET 60MIN'
    }
  ],
  기타: [
    {
      value: '[다이아몬드 헤드 하이킹]1~2명',
      label: '[다이아몬드 헤드 하이킹]1~2명',
      en_label: 'DIAMOND HEAD HIKING 1~2PAX',
      confirmation_number: 'ROYAL',
      ...DIAMOND_HEAD_HIKING
    },
    {
      value: '[다이아몬드 헤드 하이킹]3~4명',
      label: '[다이아몬드 헤드 하이킹]3~4명',
      en_label: 'DIAMOND HEAD HIKING 3~4PAX',
      confirmation_number: 'ROYAL',
      ...DIAMOND_HEAD_HIKING
    },
    {
      value: '(빅아일랜드) 마우나케아 서밋 & 스타스',
      label: '(빅아일랜드) 마우나케아 서밋 & 스타스',
      en_label: 'BIGISLAND MAUNAKEA SUMMIT STARS'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 픽업불포함',
      label: '[스타 오브 호놀룰루]3스타 픽업불포함',
      en_label: 'STAR OF HONOLULU 3STAR NO PICKUP',
      ...STAR_OF_HONOLULU_3STAR_NO_PICKUP
    },
    {
      value: '[스타 오브 호놀룰루]3스타 픽업포함',
      label: '[스타 오브 호놀룰루]3스타 픽업포함',
      en_label: 'STAR OF HONOLULU 3STAR PICKUP',
      ...STAR_OF_HONOLULU_3STAR_PICKUP
    },
    {
      value: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 픽업불포함',
      label: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 픽업불포함',
      en_label: 'STAR OF HONOLULU 3STAR FRIDAY NO PICKUP',
      ...STAR_OF_HONOLULU_3STAR_NO_PICKUP
    },
    {
      value: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 픽업포함',
      label: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 픽업포함',
      en_label: 'STAR OF HONOLULU 3STAR FRIDAY PICKUP',
      ...STAR_OF_HONOLULU_3STAR_PICKUP
    },
    {
      value: '[스타 오브 호놀룰루]3스타 셀레브레이션 픽업불포함',
      label: '[스타 오브 호놀룰루]3스타 셀레브레이션 픽업불포함',
      en_label: 'STAR OF HONOLULU 3STAR CELEBRATION NO PICKUP',
      ...STAR_OF_HONOLULU_3STAR_NO_PICKUP
    },
    {
      value: '[스타 오브 호놀룰루]3스타 셀레브레이션 픽업포함',
      label: '[스타 오브 호놀룰루]3스타 셀레브레이션 픽업포함',
      en_label: 'STAR OF HONOLULU 3STAR CELEBRATION PICKUP',
      ...STAR_OF_HONOLULU_3STAR_PICKUP
    },
    {
      value: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 셀레브레이션 픽업불포함',
      label: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 셀레브레이션 픽업불포함',
      en_label: 'STAR OF HONOLULU 3STAR FRIDAY CELEBRATION NO PICKUP',
      ...STAR_OF_HONOLULU_3STAR_NO_PICKUP
    },
    {
      value: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 셀레브레이션 픽업포함',
      label: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 셀레브레이션 픽업포함',
      en_label: 'STAR OF HONOLULU 3STAR FRIDAY CELEBRATION PICKUP',
      ...STAR_OF_HONOLULU_3STAR_PICKUP
    }
  ]
};

const additionalOptions = {
  additional_options: [] as AdditionalOptions[]
};

export const defaultClientValues = {
  korean_name: '',
  english_name: '',
  gender: GENDER_TYPE[0],
  resident_id: '',
  phone_number: '',
  email: '',
  is_main_client: false,
  status: 'InProgress' as ProductStatusKey,
  notes: ''
};

export const defaultProductValues = {
  exchange_rate: 0,
  total_amount: 0,
  total_cost: 0,
  total_amount_krw: 0,
  total_cost_krw: 0,
  status: 'Pending' as ProductStatusKey,
  payment_status: 'Unpaid' as PaymentStatusKey,
  notes: ''
};

export const defaultVoucherValues = {
  confirmation_number: '',
  delivery_notes: '',
  guide_notes: '',
  selected_clients: [] as string[]
};

export const defaultCarVoucherValues = Object.fromEntries(
  Object.entries(defaultVoucherValues).filter(([key]) => key !== 'selected_clients')
) as Omit<typeof defaultVoucherValues, 'selected_clients'>;

export const HOTEL_GUIDE_NOTES =
  '<ul><li><p>호텔 룸 BED TYPE 은 당일 호텔 사정에 의해 1BED 또는 2BED 로 배정 받으실 수도 있습니다.</p></li><li><p>하와이의 모든 호텔은 BED TYPE 과 층수의 확정 예약이 불가 합니다.</p></li><li><p>체크인 시 예약자 본인임을 확인할 수 있는 여권과 본인 신용카드를 제시하셔야 합니다.</p></li><li><p>신용카드는 룸서비스 또는 디파짓(보증금)용 으로 사용됩니다.</p></li><li><p>모든 객실은 금연입니다. 흡연이 확인되면 벌금이 부과되며, 퇴실 당할 수 있습니다.</p></li><li><p>샤워가운이나 슬리퍼, 치약, 칫솔의 지급은 호텔마다 다릅니다.</p></li><li><p>체크아웃 시 객실키를 반납하시고 객실료외 기타 청구내역의 유무를 꼭 확인하시기 바랍니다.</p></li><li><p>전화기에 불이 깜빡이면 메시지가 저장되어 있습니다. 확인하시기 바랍니다.</p></li><li><p>메이드 팁은 객실당 1일 $2 정도 침대 위에 놓아 주시면 됩니다.</p></li></ul>';

export const CAR_DELIVERY_NOTES =
  '<ul><li><p><span style="font-size: 12px; color: rgb(239, 68, 68);">운전자분의 여권, 한국면허증, 국제면허증, 운전자의 해외용 신용카드, 렌터카바우처 (5가지 미지참 시 인수불가)</span></p></li><li><p><span style="font-size: 12px;">위 준비물은 모두 여권상 영문성함과 스펠링이 같아야 하며, 트래블월렛/체크카드는 사용불가입니다.</span></p></li><li><p><span style="font-size: 12px;">렌터카 픽업 시 고객 서명 후 진행된 사항은 조인하와이에서 책임지지 않습니다.</span></p></li><li><p><span style="font-size: 12px;">현지 변경은 불가하며, 전체 임차일 중 사용하지 않은 임차일의 비용은 환불되지 않습니다.</span></p></li></ul>';

export const CAR_GUIDE_NOTES =
  '<ul><li><p><span style="font-size: 12px;">만 25세 이상 임차할 수 있는 조건입니다. (만 25세 미만은 사전에 알려주시기 바랍니다. 추가금 발생)</span></p></li><li><p><span style="font-size: 12px;">PICK UP / DROP OFF 장소가 틀릴경우 추가금이 발생됩니다.</span></p></li><li><p><span style="font-size: 12px;">교통법규 위반은 법칙금 및 Administration Fee가 사전고지 없이 임차인의 신용카드로 청구되며 높은 교통범칙금이 적용됩니다.</span></p></li><li><p><span style="font-size: 12px;">차량 고장 발생 시 허츠렌터카 24시 응급 콜센터로 연락하십시요. 허츠렌터카 24시 응급 콜센터 (800) 654 5060</span></p></li><li><p><span style="font-size: 12px;">사고 발생 시 차량을 가까운 공공장소까지 이동 후 반드시 경찰과 허츠렌터카 24시 응급서비스에 신고하고 현지에서 사고경위서를 작성하여 허츠렌터카에 제출하여 주십시요. (사고경위서는 Copy요망)</span></p></li><li><p><span style="font-size: 12px;">사고 발생 시 경찰에 신고하지 않은 경우 보상이 적용되지 않습니다.</span></p></li><li><p><span style="font-size: 12px;">임차인 상해보험 및 휴대품분실보험에 가입했을 경우 반드시 사고 발생 후 20일 이내에 PAI&amp;PEC Claim Form을 허츠렌터카에 제출하여야 합니다.</span></p></li><li><p><span style="font-size: 12px;">렌터카 수령 후 렌터카가 정상 작동하는지 꼭 확인 후 출차하시기 바랍니다.</span></p></li></ul>';

export const CAR_OFFICE_GUIDE_NOTES =
  '<ul><li><p><span style="font-size: 12px; color: rgb(239, 68, 68);"><strong>영업소의 영업시간은 현지사정에 의해 예고없이 변경될 수 있습니다.</strong></span></p></li><li><p><span style="font-size: 12px;">Honolulu Airport : AM05:30~AM24:00</span></p></li><li><p><span style="font-size: 12px;">Hyatt Regency Waikiki (2F) : AM08:00~PM15:30 (영업시간 이후 반납 불가)</span></p></li><li><p><span style="font-size: 12px;">Imperial Hotel : AM07:00~PM15:00 (영업시간이후 무인반납은 호텔투숙객만 가능)</span></p></li><li><p><span style="font-size: 12px;">Kahului Airport Maui : AM05:30~PM23:00</span></p></li><li><p><span style="font-size: 12px;">Kona Keahole Airport : AM05:00~PM22:30</span></p></li><li><p><span style="font-size: 12px;">Hilo Airport : AM06:00~PM22:00</span></p></li><li><p><span style="font-size: 12px;">Lihue Airport : AM05:00~PM23:00</span></p></li></ul>';

export const defaultPeopleValues = {
  adult_count: 0,
  children_count: 0,
  kids_count: 0,
  adult_price: 0,
  children_price: 0,
  kids_price: 0,
  adult_cost: 0,
  children_cost: 0,
  kids_cost: 0
};

export const defaultFlightValues = {
  flight_number: '',
  departure_datetime: null,
  departure_city: '',
  arrival_datetime: null,
  arrival_city: '',
  remarks: '',
  rule: '',
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultHotelValues = {
  region: REGIONS[0],
  check_in_date: null,
  check_out_date: null,
  hotel_name: '',
  room_type: '',
  bed_type: '',
  is_breakfast_included: false,
  is_resort_fee: false,
  resort_fee_type: RESORT_FEE_TYPE_LIST[0].value,
  nights: 1,
  nightly_rate: 0,
  cost: 0,
  remarks: '',
  rule: '',
  ...defaultVoucherValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultTourValues = {
  region: REGIONS[0],
  start_date: null,
  end_date: null,
  name: '',
  reception: 'PICK UP' as const,
  arrival_time: '00:00:00',
  arrival_location: '',
  liability_waiver_url: '',
  remarks: '',
  rule: '',
  voucher_number: '',
  ...defaultVoucherValues,
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
};

export type CarCompany = 'HERTZ' | 'DOLLAR';

export const defaultCarValues = {
  region: REGIONS[0],
  pickup_date: null,
  return_date: null,
  model: '',
  options: '',
  driver: '',
  company: 'HERTZ' as CarCompany,
  pickup_location: '',
  return_location: '',
  rental_days: 1,
  daily_rate: 0,
  cost: 0,
  remarks: '',
  rule: '',
  ...defaultCarVoucherValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultInsuranceValues = {
  company: '',
  days: 1,
  condition: '',
  start_date: null,
  end_date: null,
  remarks: '',
  rule: '',
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultAdditionalOptionValues = {
  reservation_id: '',
  pid: 0,
  type: '' as ProductType,
  title: '',
  ...defaultPeopleValues,
  ...defaultProductValues
};

export const PRODUCT_STATUS_COLOR: Record<
  ProductStatusKey,
  typeof selectTriggerPropDefs.color.default
> = {
  Pending: 'red',
  InProgress: 'yellow',
  Confirmed: 'blue',
  ChangeRequested: 'red',
  CancelRequested: 'red',
  Cancelled: 'blue',
  RefundRequested: 'red',
  Refunded: 'blue',
  OnHold: 'yellow',
  Checked: 'blue'
};

export const PAYMENT_STATUS_COLOR: Record<
  PaymentStatusKey,
  typeof selectTriggerPropDefs.color.default
> = {
  Unpaid: 'yellow',
  Deposit: 'blue',
  Full: 'green',
  Refunded: 'red'
};

export const PRODUCT_OPTIONS: { label: string; value: ProductType; table: ProductsType }[] = [
  {
    label: '항공',
    value: 'flight',
    table: 'flights'
  },
  {
    label: '호텔',
    value: 'hotel',
    table: 'hotels'
  },
  {
    label: '선택관광',
    value: 'tour',
    table: 'tours'
  },
  {
    label: '렌터카',
    value: 'rental_car',
    table: 'rental_cars'
  },
  {
    label: '보험',
    value: 'insurance',
    table: 'insurances'
  }
];

export const PRODUCT_LABEL: Record<ProductType, string> = PRODUCT_OPTIONS.reduce(
  (acc, { value, label }) => {
    acc[value] = label;
    return acc;
  },
  {} as Record<ProductType, string>
);

export const PRODUCT_COLOR: Record<ProductType, typeof selectTriggerPropDefs.color.default> = {
  flight: 'green',
  hotel: 'blue',
  tour: 'ruby',
  rental_car: 'lime',
  insurance: 'amber'
};
