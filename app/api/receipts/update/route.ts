import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ───── authentication ─────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ───── validate body ─────
    const { id, merchant_name, transaction_date, total_amount, items } =
      await request.json();

    if (!id)                                       return NextResponse.json({ error: 'Receipt ID is required' }, { status: 400 });
    if (!merchant_name?.trim() || merchant_name.trim().length < 2)
                                                   return NextResponse.json({ error: 'Merchant name must be ≥ 2 chars' }, { status: 400 });
    if (!Date.parse(transaction_date))             return NextResponse.json({ error: 'Valid transaction date required' }, { status: 400 });
    if (!(typeof total_amount === 'number' && total_amount > 0))
                                                   return NextResponse.json({ error: 'Total amount must be > 0' }, { status: 400 });
    if (!Array.isArray(items))                     return NextResponse.json({ error: 'Items must be an array' }, { status: 400 });

    // ───── fetch existing receipt ─────
    const { data: receipt, error: findErr } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findErr || !receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // ───── update ─────
    const { data: updated, error: updateErr } = await supabase
      .from('receipts')
      .update({
        merchant_name: merchant_name.trim(),
        transaction_date,
        total_amount,
        metadata: {
          ...receipt.metadata,
          items,
          edited_at: new Date().toISOString(),
        },
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error(updateErr);
      return NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 });
    }

    return NextResponse.json({ success: true, receipt: updated });
  } catch (err) {
    console.error('Update route error:', err);
    return NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 });
  }
} 