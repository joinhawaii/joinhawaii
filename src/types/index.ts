import { type useMutation } from '@tanstack/react-query';
import {
  defaultAdditionalOptionValues,
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultInsuranceValues,
  defaultProductValues,
  defaultTourValues,
  PaymentStatus,
  ProductStatus
} from '../constants';

export type Client = typeof defaultClientValues;
export type Flight = typeof defaultFlightValues & { id?: number };
export type Hotel = Omit<typeof defaultHotelValues, 'check_in_date' | 'check_out_date'> & {
  id?: number;
  check_in_date: string | null;
  check_out_date: string | null;
};
export type Tour = Omit<typeof defaultTourValues, 'start_date' | 'end_date'> & {
  id?: number;
  start_date: string | null;
  end_date: string | null;
};
export type Car = Omit<typeof defaultCarValues, 'pickup_date' | 'return_date'> & {
  id?: number;
  pickup_date: string | null;
  return_date: string | null;
};
export type Insurance = Omit<typeof defaultInsuranceValues, 'start_date' | 'end_date'> & {
  id?: number;
  start_date: string | null;
  end_date: string | null;
};
export type ProductStatusKey = keyof typeof ProductStatus;
export type PaymentStatusKey = keyof typeof PaymentStatus;
export type ProductValues = typeof defaultProductValues & {
  id?: number;
  type: ProductType;
  additional_options: AdditionalOptions[];
};

export type AdditionalOptions = typeof defaultAdditionalOptionValues & { id?: number };

export type AllProducts = {
  id: number;
  reservation_id: string;
  created_at: string;
  event_date: string;
  booking_platform: string;
  main_client_name: string;
  clients: string[];
  product_name: string;
  type: ProductType;
  total_cost_krw: number;
  total_amount_krw: number;
  additional_options: AdditionalOptions[];
} & {
  [key: string]: unknown;
} & ProductValues;

export type ProductType = 'flight' | 'hotel' | 'tour' | 'rental_car' | 'insurance';
export type ProductsType = `${ProductType}s`;

export type UpdateProductStatusParams = {
  reservation_id: string;
  product_type: ProductType;
  product_id: number;
  status: ProductStatusKey;
};

export type BaseRow = {
  id: number;
  reservation_id: string;
  created_at: string;
  updated_at: string;
  additional_options: AdditionalOptions[];
};

export interface ReservationItem {
  clients: Client[];
  flights: Flight[];
  hotels: Hotel[];
  tours: Tour[];
  rental_cars: Car[];
  insurances: Insurance[];
}

export type ReservationBaseInfo = {
  reservation_id?: string;
  exchange_rate: number;
  booking_platform: string;
  main_client_name: string;
  total_amount: number;
  reservation_fee: number;
  deposit: number;
  trip_type: string;
  travel_category: string;
  start_date: string | null;
  end_date: string | null;
  nights: number;
  days: number;
  content: string;
};

export interface ReservationSuccessResponse {
  reservation_id: string;
  booking_platform: string;
  total_amount: number;
  id: number;
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableSchema<TRow, TInsert = Omit<TRow, 'id'>, TUpdate = Partial<TRow>> = {
  Row: TRow;
  Insert: TInsert;
  Update: TUpdate;
  Relationships: never[];
};

export type ReservationFormData = ReservationBaseInfo & ReservationItem;

export type ReservationRequest = ReservationFormData;

export interface Database {
  public: {
    Tables: {
      reservations: TableSchema<
        ReservationBaseInfo & {
          id: number;
          reservation_id: string;
          status: string;
          created_at: string;
          author?: string;
          author_email?: string;
          total_cost?: number;
          total_amount_krw?: number;
          total_cost_krw?: number;
          payment_status?: string;
          is_confirmation_published?: boolean;
        },
        Partial<ReservationBaseInfo> & {
          id?: number;
          reservation_id: string;
          status?: string;
          created_at?: string;
          author?: string;
          author_email?: string;
          main_client_name: string;
          is_confirmation_published?: boolean;
        }
      >;
      clients: TableSchema<
        BaseRow & Client,
        Omit<Client, 'id'> & { reservation_id: string; id?: number; created_at?: string },
        Partial<Client> & { reservation_id?: string }
      >;
      flights: TableSchema<
        BaseRow & Flight,
        Omit<Flight, 'id'> & { reservation_id: string; created_at?: string; id?: number },
        Partial<Flight> & { reservation_id?: string; created_at?: string }
      >;
      hotels: TableSchema<
        BaseRow & Hotel,
        Omit<Hotel, 'id'> & { reservation_id: string; created_at?: string; id?: number },
        Partial<Hotel> & { reservation_id?: string; created_at?: string }
      >;
      tours: TableSchema<
        BaseRow & Tour,
        Omit<Tour, 'id'> & { reservation_id: string; created_at?: string; id?: number },
        Partial<Tour> & { reservation_id?: string; created_at?: string }
      >;
      rental_cars: TableSchema<
        BaseRow & Car,
        Omit<Car, 'id'> & { reservation_id: string; created_at?: string; id?: number },
        Partial<Car> & { reservation_id?: string; created_at?: string }
      >;
      insurances: TableSchema<
        BaseRow & Insurance,
        Omit<Insurance, 'id'> & { reservation_id: string; created_at?: string; id?: number },
        Partial<Insurance> & { reservation_id?: string; created_at?: string }
      >;
      options: TableSchema<
        AdditionalOptions & { id: number },
        Omit<AdditionalOptions, 'id'>,
        Partial<AdditionalOptions>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_reservation: {
        Args: {
          p_reservation_id: string;
          p_clients: Json;
          p_flights?: Json;
          p_main_client_name: string;
          p_hotels?: Json;
          p_tours?: Json;
          p_cars?: Json;
          p_insurances?: Json;
        };
        Returns: Json;
      };
      calculate_reservation_total: {
        Args: { p_reservation_id: string };
        Returns: ReservationTotalResult;
      };
      update_product_status: {
        Args: { payload: UpdateProductStatusParams };
        Returns: ReservationTotalResult;
      };
    };
  };
}

export type ReservationTotalResult = {
  total_amount?: number;
  total_cost?: number;
  total_amount_krw?: number;
  total_cost_krw?: number;
};

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type ReservationRow = TablesRow<'reservations'>;

export interface Reservation extends ReservationBaseInfo {
  id: number;
  status: ProductStatusKey;
  created_at: string;
  clients: TablesRow<'clients'>[];
  total_amount_krw: number;
  total_cost_krw: number;
  author?: string;
  author_email?: string;
  payment_status: PaymentStatusKey;
  is_confirmation_published?: boolean;
}

export type ReservationProducts = {
  [K in ProductsType]: TablesRow<K>[];
};

export type ReservationResponse = Reservation & { products: ReservationProducts };

export type ReservationQueryResponse = Reservation & ReservationProducts;

export type ProductWithReservation<T> = T & {
  reservations: {
    main_client_name: string;
    booking_platform: string;
    is_confirmation_published: boolean;
    clients: { korean_name: string }[];
  };
};

type PartialProductWithId<T> = Array<Partial<T> & { id?: number }>;

export interface ReservationUpdateRequest {
  reservation_id: string;
  exchange_rate: number;
  status?: string;
  main_client_name?: string;
  total_amount?: number;
  clients?: PartialProductWithId<TablesRow<'clients'>>;
  flights?: PartialProductWithId<TablesRow<'flights'>>;
  hotels?: PartialProductWithId<TablesRow<'hotels'>>;
  tours?: PartialProductWithId<TablesRow<'tours'>>;
  rental_cars?: PartialProductWithId<TablesRow<'rental_cars'>>;
  insurances?: PartialProductWithId<TablesRow<'insurances'>>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export type ProductFormType = keyof ReservationItem;

export interface ProductFormProps {
  data: ReservationResponse;
  mutation: ReturnType<
    typeof useMutation<{ data: ReservationResponse }, Error, ReservationFormData>
  >;
  handleAdditionalOptions: (context: {
    id: number;
    type: ProductType;
    title: string;
    data: AdditionalOptions[];
  }) => void;
}
