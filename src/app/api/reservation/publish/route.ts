import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { reservation_id, is_confirmation_published = true } = (await request.json()) as {
      reservation_id?: string;
      is_confirmation_published?: boolean;
    };

    if (!reservation_id) {
      throw new Error('reservation_id가 필요합니다.');
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('author_email')
      .eq('reservation_id', reservation_id)
      .single();

    if (fetchError || !reservation) {
      throw new Error('예약을 찾을 수 없습니다.');
    }

    // if (reservation.author_email !== user.email) {
    //   return NextResponse.json(
    //     { success: false, error: '작성자 본인만 발행 상태를 변경할 수 있습니다.' },
    //     { status: 403 }
    //   );
    // }

    const { data, error } = await supabase
      .from('reservations')
      .update({ is_confirmation_published })
      .eq('reservation_id', reservation_id)
      .select('is_confirmation_published')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: is_confirmation_published
        ? '예약확인서가 발행되었습니다'
        : '예약확인서 발행이 취소되었습니다',
      data
    });
  } catch (error) {
    console.error('예약확인서 발행 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '예약확인서 발행에 실패했습니다.'
      },
      { status: 500 }
    );
  }
}
