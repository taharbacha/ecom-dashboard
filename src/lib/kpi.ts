import { OrderRow, filterOrdersByDate } from './sheets';

export interface ProductKPI {
    productName: string;
    // Volume Metrics
    totalCommandes: number;
    totalShiped: number;
    totalLivree: number;
    totalRetour: number;

    // Performance Metrics (COD-Optimized)
    shippingRate: number;    // (shiped + completed + failed) / commandes * 100
    deliveryRate: number;    // completed / (shiped + completed + failed) * 100
    returnRate: number;      // failed / (shiped + completed + failed) * 100

    // Financial KPIs
    benficeTotal: number;
    adSpend: number;
    benficeFinal: number;
}

/**
 * Calculate KPIs based on the COD-Optimized model:
 * - Shipping Rate: Operational progression
 * - Delivery Rate: True COD performance (most important)
 * - Return Rate: Refusal risk
 */
export function calculateKPIs(
    productName: string,
    orders: OrderRow[],
    adSpend: number,
    startDate: Date | null = null,
    endDate: Date | null = null
): ProductKPI {
    // Filter by date if provided
    const filteredOrders = filterOrdersByDate(orders, startDate, endDate);

    // 1️⃣ Volume Metrics
    const totalCommandes = filteredOrders.length;
    // Note: status check is case-insensitive in sheets.ts, but we check specific slugs here
    const totalShiped = filteredOrders.filter(o => o.status === 'shiped').length;
    const totalLivree = filteredOrders.filter(o => o.status === 'completed').length;
    const totalRetour = filteredOrders.filter(o => o.status === 'failed').length;

    // 2️⃣ Performance Metrics (COD-Optimized)

    // Base for delivery/return rates (Advanced orders)
    const deliveryBase = totalShiped + totalLivree + totalRetour;

    // Shipping Rate: (shiped + completed + failed) / total commandes
    const shippingRate = totalCommandes > 0
        ? (deliveryBase / totalCommandes) * 100
        : 0;

    // Delivery Rate: completed / (shiped + completed + failed)
    const deliveryRate = deliveryBase > 0
        ? (totalLivree / deliveryBase) * 100
        : 0;

    // Return Rate: failed / (shiped + completed + failed)
    const returnRate = deliveryBase > 0
        ? (totalRetour / deliveryBase) * 100
        : 0;

    // 💰 Financial KPIs
    const benficeTotal = filteredOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.benficeNet, 0);

    const benficeFinal = benficeTotal - adSpend;

    return {
        productName,
        totalCommandes,
        totalShiped,
        totalLivree,
        totalRetour,
        shippingRate,
        deliveryRate,
        returnRate,
        benficeTotal,
        adSpend,
        benficeFinal,
    };
}

// Format number as DZD currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-DZ', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount) + ' DZD';
}

// Format percentage
export function formatPercent(value: number): string {
    return value.toFixed(1) + '%';
}
