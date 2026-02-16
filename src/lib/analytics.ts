import { OrderRow, ProductData, AdSpendData, parseDate } from './sheets';

export interface DailyStat {
    date: string; // YYYY-MM-DD for sorting/display
    orders: number;
    delivered: number;
    returned: number;
    profit: number; // Sum of benficeNet for completed orders
}

export interface GlobalStats {
    totalOrders: number;
    totalShipped: number;
    totalDelivered: number;
    totalReturned: number;
    totalProfit: number; // Sum of benficeNet
    totalAdSpend: number;
    netProfit: number; // totalProfit - totalAdSpend
    shippingRate: number;
    deliveryRate: number;
    returnRate: number;
}

/**
 * Aggregates all orders from all products into daily statistics for the chart
 */
export function getDailyStats(products: ProductData[]): DailyStat[] {
    const statsMap = new Map<string, DailyStat>();

    products.forEach(product => {
        product.orders.forEach(order => {
            const dateObj = parseDate(order.date);
            if (!dateObj) return;

            // Format as YYYY-MM-DD to use as key
            const dateKey = dateObj.toISOString().split('T')[0];

            if (!statsMap.has(dateKey)) {
                statsMap.set(dateKey, {
                    date: dateKey,
                    orders: 0,
                    delivered: 0,
                    returned: 0,
                    profit: 0,
                });
            }

            const stat = statsMap.get(dateKey)!;

            // Increment counts
            stat.orders += 1;

            const status = order.status.toLowerCase();
            if (status === 'completed') {
                stat.delivered += 1;
                stat.profit += order.benficeNet;
            } else if (status === 'failed') {
                stat.returned += 1;
            }
        });
    });

    // Convert map to array and sort by date
    return Array.from(statsMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
    );
}

/**
 * Calculates global aggregated statistics for the Summary Cards
 */
export function getGlobalStats(products: ProductData[], adSpend: AdSpendData): GlobalStats {
    let totalOrders = 0;
    let totalShipped = 0;
    let totalDelivered = 0;
    let totalReturned = 0;
    let totalProfit = 0;
    let totalAdSpend = 0;

    // Sum up product stats
    products.forEach(product => {
        const orders = product.orders;
        totalOrders += orders.length;

        // Status counts
        totalShipped += orders.filter(o => o.status === 'shiped').filter(Boolean).length;
        totalDelivered += orders.filter(o => o.status === 'completed').filter(Boolean).length;
        totalReturned += orders.filter(o => o.status === 'failed').filter(Boolean).length;

        // Profit
        const productProfit = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.benficeNet, 0);
        totalProfit += productProfit;

        // Ad Spend
        totalAdSpend += adSpend[product.name] || 0;
    });

    // Calculate Rates
    const advancedBase = totalShipped + totalDelivered + totalReturned;

    const shippingRate = totalOrders > 0
        ? (advancedBase / totalOrders) * 100
        : 0;

    const deliveryRate = advancedBase > 0
        ? (totalDelivered / advancedBase) * 100
        : 0;

    const returnRate = advancedBase > 0
        ? (totalReturned / advancedBase) * 100
        : 0;

    const netProfit = totalProfit - totalAdSpend;

    return {
        totalOrders,
        totalShipped,
        totalDelivered,
        totalReturned,
        totalProfit,
        totalAdSpend,
        netProfit,
        shippingRate,
        deliveryRate,
        returnRate
    };
}
