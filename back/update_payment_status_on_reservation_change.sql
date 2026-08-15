DECLARE
  v_reservation_fee NUMERIC := COALESCE(NEW.reservation_fee, 0);
  v_deposit NUMERIC := COALESCE(NEW.deposit, 0);
  v_total   NUMERIC := COALESCE(NEW.total_amount, 0);
  v_due     NUMERIC := v_total - v_deposit;
  v_new_status payment_status;
  u_flights INT := 0;
  u_hotels INT := 0;
  u_tours INT := 0;
  u_rental_cars INT := 0;
  u_insurances INT := 0;
  u_options INT := 0;
BEGIN
  IF v_due = 0 THEN
    v_new_status := 'Full'::payment_status;
  ELSIF v_reservation_fee = 0 THEN
    v_new_status := 'Unpaid'::payment_status;
  ELSIF v_reservation_fee > 0 THEN
    v_new_status := 'Deposit'::payment_status;
  ELSE
    v_new_status := 'Unpaid'::payment_status;
  END IF;

  IF NEW.reservation_id IS NULL THEN
    -- 트리거 컨텍스트에서 업데이트를 취소하지 않도록 NEW를 반환
    RETURN NEW;
  END IF;

  -- 필요 시, 예약 자체의 상태도 변경하려면 다음 줄을 활성화:
  -- NEW.payment_status := v_new_status;

  UPDATE flights
  SET payment_status = v_new_status
  WHERE reservation_id = NEW.reservation_id
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM 'Refunded'::payment_status)
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM v_new_status);
  GET DIAGNOSTICS u_flights = ROW_COUNT;

  UPDATE hotels
  SET payment_status = v_new_status
  WHERE reservation_id = NEW.reservation_id
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM 'Refunded'::payment_status)
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM v_new_status);
  GET DIAGNOSTICS u_hotels = ROW_COUNT;

  UPDATE tours
  SET payment_status = v_new_status
  WHERE reservation_id = NEW.reservation_id
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM 'Refunded'::payment_status)
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM v_new_status);
  GET DIAGNOSTICS u_tours = ROW_COUNT;

  UPDATE rental_cars
  SET payment_status = v_new_status
  WHERE reservation_id = NEW.reservation_id
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM 'Refunded'::payment_status)
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM v_new_status);
  GET DIAGNOSTICS u_rental_cars = ROW_COUNT;

  UPDATE insurances
  SET payment_status = v_new_status
  WHERE reservation_id = NEW.reservation_id
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM 'Refunded'::payment_status)
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM v_new_status);
  GET DIAGNOSTICS u_insurances = ROW_COUNT;

  UPDATE options
  SET payment_status = v_new_status
  WHERE reservation_id = NEW.reservation_id
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM 'Refunded'::payment_status)
    AND (payment_status IS NULL OR payment_status IS DISTINCT FROM v_new_status);
  GET DIAGNOSTICS u_options = ROW_COUNT;

  -- 반드시 NEW를 반환해서 업데이트가 진행되도록 함
  RETURN NEW;
END;