export interface SupplierPaymentStatus {
    orderRef: string;
    isPaid: boolean;
}

// In the future, you will connect this to Supabase.
// For example:
// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// const supabase = createClient(supabaseUrl, supabaseKey)

// Local storage key for current implementation
const STORAGE_KEY = 'ecom_supplier_payments_status';

export async function getSupplierPaymentStatus(orderRef: string): Promise<boolean> {
    if (typeof window === 'undefined') return false; // SSR guard

    /* 
    Supabase Implementation (Future):
    const { data, error } = await supabase
        .from('supplier_payments')
        .select('is_paid')
        .eq('order_ref', orderRef)
        .single();
    if (error) return false;
    return data?.is_paid || false;
    */

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data: Record<string, boolean> = JSON.parse(stored);
            return data[orderRef] || false;
        }
    } catch (e) {
        console.error("Error reading supplier payment status", e);
    }
    return false;
}

export async function getAllSupplierPaymentStatuses(): Promise<Record<string, boolean>> {
    if (typeof window === 'undefined') return {}; // SSR guard

    /*
    Supabase Implementation (Future):
    const { data, error } = await supabase
        .from('supplier_payments')
        .select('order_ref, is_paid');
    if (error) return {};
    
    return data.reduce((acc, row) => {
        acc[row.order_ref] = row.is_paid;
        return acc;
    }, {});
    */

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error reading all supplier payment statuses", e);
    }
    return {};
}

export async function updateSupplierPaymentStatus(orderRef: string, isPaid: boolean): Promise<boolean> {
    /* 
    Supabase Implementation (Future):
    const { error } = await supabase
        .from('supplier_payments')
        .upsert({ order_ref: orderRef, is_paid: isPaid });
    return !error;
    */

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data: Record<string, boolean> = stored ? JSON.parse(stored) : {};
        data[orderRef] = isPaid;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error("Error updating supplier payment status", e);
        return false;
    }
}
