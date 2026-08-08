import { createClient } from '@/lib/supabase/server';
import type { AdditionalOptions, ProductType, TablesInsert } from '@/types';
import { calculateTotalAmount } from '@/utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: AdditionalOptions[] = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('options')
      .insert(body.map(({ id: _id, ...rest }) => rest) as TablesInsert<'options'>[])
      .select();

    if (error) {
      console.error('추가 옵션 등록 실패:', error);
      throw error;
    }

    return NextResponse.json({
      message: `추가 옵션이 등록되었습니다`,
      success: true,
      data
    });
  } catch (error) {
    console.error('추가 옵션 등록 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '추가 옵션 등록 실패',
        details: error
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id: number };

    if (!Number.isFinite(body.id)) {
      throw new Error('유효한 id가 필요합니다.');
    }

    const supabase = await createClient();

    const { data: deletedRow, error: deleteError } = await supabase
      .from('options')
      .delete()
      .select('reservation_id')
      .eq('id', body.id)
      .single();

    if (deleteError) {
      throw deleteError;
    }

    if (!deletedRow?.reservation_id) {
      throw new Error('삭제된 항목의 예약 정보를 찾을 수 없습니다.');
    }

    const { error: totalError } = await supabase.rpc('calculate_reservation_total', {
      p_reservation_id: deletedRow.reservation_id
    });

    if (totalError) {
      throw totalError;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: body.id,
        reservation_id: deletedRow.reservation_id
      }
    });
  } catch (error) {
    console.error('추가 옵션 삭제 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '추가 옵션 삭제에 실패했습니다.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pid = searchParams.get('pid');
    const type = searchParams.get('type');

    const supabase = await createClient();
    const query = supabase
      .from('options')
      .select<string, AdditionalOptions>('*')
      .order('id', { ascending: true });

    if (pid) query.eq('pid', Number(pid));
    if (type) query.eq('type', type as ProductType);

    const { data, error } = await query;

    if (error) {
      console.error('추가 옵션 조회 실패:', error);
      throw error;
    }

    const dataIncludedTotal = data.map(item => {
      return {
        ...item,
        ...calculateTotalAmount(item)
      };
    });

    return NextResponse.json({
      success: true,
      data: dataIncludedTotal
    });
  } catch (error) {
    console.error('추가 옵션 조회 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '추가 옵션 조회 실패',
        details: error
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body: AdditionalOptions[] = await request.json();
    const supabase = await createClient();
    const reservation_id = body[0]?.reservation_id;

    const toInsert = body.filter(item => !item.id);
    const toUpdate = body.filter(item => !!item.id);

    const { data: inserted = [], error: insertError } = toInsert.length
      ? await supabase
          .from('options')
          .insert(toInsert.map(({ id: _id, ...rest }) => rest) as TablesInsert<'options'>[])
          .select()
      : { data: [], error: null };
    if (insertError) throw insertError;

    const updated = toUpdate.length
      ? (
          await Promise.all(
            toUpdate.map(item => supabase.from('options').update(item).eq('id', item.id!).select())
          )
        ).flatMap(res => res.data ?? [])
      : [];

    const { data: totals } = await supabase.rpc('calculate_reservation_total', {
      p_reservation_id: reservation_id
    });

    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update({
        ...(totals ?? {})
      })
      .eq('reservation_id', reservation_id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedReservation) throw new Error('예약 정보를 찾을 수 없습니다.');

    return NextResponse.json({
      message: `추가 옵션이 처리되었습니다`,
      success: true,
      data: [...(inserted ?? []), ...updated]
    });
  } catch (error) {
    console.error('추가 옵션 등록/수정 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '추가 옵션 등록/수정 실패',
        details: error
      },
      { status: 500 }
    );
  }
}
