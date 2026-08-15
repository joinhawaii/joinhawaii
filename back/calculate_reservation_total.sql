
DECLARE
  v_total_amount numeric(12,2) := 0;
  v_total_cost   numeric(12,2) := 0;
  v_deposit      numeric(12,2) := 0;
BEGIN
  -- 항공권 합계
  v_total_amount := COALESCE(
    (SELECT SUM(total_amount)::numeric FROM flights WHERE reservation_id = p_reservation_id),
    0::numeric
  );
  v_total_cost := COALESCE(
    (SELECT SUM(total_cost)::numeric FROM flights WHERE reservation_id = p_reservation_id),
    0::numeric
  );

  -- 호텔 합계
  v_total_amount := v_total_amount + COALESCE(
    (SELECT SUM(total_amount)::numeric FROM hotels WHERE reservation_id = p_reservation_id),
    0::numeric
  );
  v_total_cost := v_total_cost + COALESCE(
    (SELECT SUM(total_cost)::numeric FROM hotels WHERE reservation_id = p_reservation_id),
    0::numeric
  );

  -- 투어 합계
  v_total_amount := v_total_amount + COALESCE(
    (SELECT SUM(total_amount)::numeric FROM tours WHERE reservation_id = p_reservation_id),
    0::numeric
  );
  v_total_cost := v_total_cost + COALESCE(
    (SELECT SUM(total_cost)::numeric FROM tours WHERE reservation_id = p_reservation_id),
    0::numeric
  );

  -- 렌터카 합계
  v_total_amount := v_total_amount + COALESCE(
    (SELECT SUM(total_amount)::numeric FROM rental_cars WHERE reservation_id = p_reservation_id),
    0::numeric
  );
  v_total_cost := v_total_cost + COALESCE(
    (SELECT SUM(total_cost)::numeric FROM rental_cars WHERE reservation_id = p_reservation_id),
    0::numeric
  );

  -- 보험 합계
  v_total_amount := v_total_amount + COALESCE(
    (SELECT SUM(total_amount)::numeric FROM insurances WHERE reservation_id = p_reservation_id),
    0::numeric
  );
  v_total_cost := v_total_cost + COALESCE(
    (SELECT SUM(total_cost)::numeric FROM insurances WHERE reservation_id = p_reservation_id),
    0::numeric
  );

  -- 추가상품 합계
  v_total_amount := v_total_amount + COALESCE(
    (SELECT SUM(total_amount)::numeric FROM options WHERE reservation_id = p_reservation_id),
    0::numeric
  );
  v_total_cost := v_total_cost + COALESCE(
    (SELECT SUM(total_cost)::numeric FROM options WHERE reservation_id = p_reservation_id),
    0::numeric
  );

  -- reservations 테이블에서 deposit 가져오기
  SELECT COALESCE(deposit::numeric, 0::numeric)
  INTO v_deposit
  FROM reservations
  WHERE reservation_id = p_reservation_id
  LIMIT 1;

  RETURN jsonb_build_object(
    'deposit', ROUND(v_deposit, 2),
    'total_amount', ROUND(v_total_amount, 2),
    'total_cost', ROUND(v_total_cost, 2)
  );
END;
