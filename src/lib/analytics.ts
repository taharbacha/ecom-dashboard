import { OrderRow, ProductData, AdSpendRow, parseDate } from './sheets';

export interface DailyStat {
    date: string; // YYYY-MM-DD
    orders: number;
    delivered: number;
    returned: number;
    profit: number; // Sum of benficeNet for completed orders
    adSpend: number; // Proportional ad spend for this day
    netProfit: number; // profit - adSpend
}

export interface GlobalStats {
    totalOrders: number;
    totalShipped: number;
    totalDelivered: number;
    totalReturned: number;
    totalRevenue: number;
    totalProfit: number; // Sum of benficeNet
    totalAdSpend: number;
    netProfit: number; // totalProfit - totalAdSpend
    shippingRate: number;
    deliveryRate: number;
    returnRate: number;
    cpa: number;
    roas: number;
    aov: number;
}

export interface WilayaStat {
    wilaya: string;
    count: number;
    revenue: number;
    profit: number;
    delivered: number;
    returned: number;
}

export interface StatusStat {
    status: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
}

/**
 * Helper to check if a product is selected (if filter is active)
 */
function isProductSelected(productId: string, selectedProducts: string[]): boolean {
    if (selectedProducts.length === 0) return true; // No filter = all selected
    return selectedProducts.includes(productId);
}

/**
 * Calculates daily ad spend for a specific product and date
 */
function getDailyAdSpend(
    productName: string,
    dateStr: string,
    adSpendRows: AdSpendRow[]
): number {
    const date = new Date(dateStr);
    let dailySpend = 0;

    for (const row of adSpendRows) {
        if (row.product !== productName) continue;

        const fromDate = new Date(row.from);
        const toDate = new Date(row.to);

        // Check if date falls within the ad period
        if (date >= fromDate && date <= toDate) {
            // Calculate total days in the ad period
            const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
            const totalPeriodDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (totalPeriodDays > 0) {
                dailySpend += row.amountDZD / totalPeriodDays;
            }
        }
    }
    return dailySpend;
}

/**
 * Aggregates all orders and ad spend into daily statistics
 */
export function getDailyStats(
    products: ProductData[],
    adSpendRows: AdSpendRow[],
    selectedProducts: string[] = []
): DailyStat[] {
    const statsMap = new Map<string, DailyStat>();

    // 1. Process Orders
    products.forEach(product => {
        if (!isProductSelected(product.id, selectedProducts)) return;

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
                    adSpend: 0,
                    netProfit: 0
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

    // 2. Process Ad Spend
    adSpendRows.forEach(row => {
        if (!isProductSelected(row.productId || '', selectedProducts)) return;

        const fromDate = new Date(row.from);
        const toDate = new Date(row.to);
        const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
        const totalPeriodDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const dailyAmount = row.amountDZD / totalPeriodDays;

        // Loop through each day of the ad period
        for (let i = 0; i < totalPeriodDays; i++) {
            const currentDate = new Date(fromDate);
            currentDate.setDate(fromDate.getDate() + i);
            const dateKey = currentDate.toISOString().split('T')[0];

            if (!statsMap.has(dateKey)) {
                statsMap.set(dateKey, {
                    date: dateKey,
                    orders: 0,
                    delivered: 0,
                    returned: 0,
                    profit: 0,
                    adSpend: 0,
                    netProfit: 0
                });
            }

            const stat = statsMap.get(dateKey)!;
            stat.adSpend += dailyAmount;
        }
    });

    // Calculate Net Profit for each day
    statsMap.forEach(stat => {
        stat.netProfit = stat.profit - stat.adSpend;
    });

    // Convert map to array and sort by date
    return Array.from(statsMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
    );
}

/**
 * Calculates global aggregated statistics with proportional ad spend logic
 */
export function getGlobalStats(
    products: ProductData[],
    adSpendRows: AdSpendRow[],
    startDate: Date | null,
    endDate: Date | null,
    selectedProducts: string[] = []
): GlobalStats {
    let totalOrders = 0;
    let totalShipped = 0;
    let totalDelivered = 0;
    let totalReturned = 0;
    let totalProfit = 0;
    let totalRevenue = 0;
    let totalAdSpend = 0;

    // 1. Sum up product stats
    products.forEach(product => {
        if (!isProductSelected(product.id, selectedProducts)) return;

        const orders = product.orders; // These are already filtered by date in page.tsx? 
        // Important: page.tsx filters orders by date before passing here? 
        // If so, we just sum them up. If not, we must filter.
        // The implementation in page.tsx creates `filteredProducts` with filtered orders.
        // So we can assume `products` here only contains relevant orders.

        totalOrders += orders.length;

        // Status counts
        totalShipped += orders.filter(o => o.status === 'shiped').filter(Boolean).length;
        totalDelivered += orders.filter(o => o.status === 'completed').filter(Boolean).length;
        totalReturned += orders.filter(o => o.status === 'failed').filter(Boolean).length;

        // Revenue
        totalRevenue += orders.reduce((sum, o) => sum + o.prixDeVente, 0);

        // Profit
        const productProfit = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.benficeNet, 0);
        totalProfit += productProfit;
    });

    // 2. Calculate Proportional Ad Spend
    adSpendRows.forEach(row => {
        if (!isProductSelected(row.productId || '', selectedProducts)) return;

        const rowFrom = new Date(row.from);
        const rowTo = new Date(row.to);

        // Determine overlap with selected range (startDate, endDate)
        let overlapStart = rowFrom;
        let overlapEnd = rowTo;

        if (startDate && startDate > rowFrom) overlapStart = startDate;
        if (endDate && endDate < rowTo) overlapEnd = endDate;

        if (overlapStart <= overlapEnd) {
            const overlapDiff = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
            const overlapDays = Math.ceil(overlapDiff / (1000 * 60 * 60 * 24)) + 1;

            const totalDiff = Math.abs(rowTo.getTime() - rowFrom.getTime());
            const totalPeriodDays = Math.ceil(totalDiff / (1000 * 60 * 60 * 24)) + 1;

            if (totalPeriodDays > 0) {
                // Proportional allocation
                totalAdSpend += (overlapDays / totalPeriodDays) * row.amountDZD;
            }
        }
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

    // Advanced KPIs
    const cpa = totalDelivered > 0 ? totalAdSpend / totalDelivered : 0;
    const roas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
        totalOrders,
        totalShipped,
        totalDelivered,
        totalReturned,
        totalRevenue,
        totalProfit,
        totalAdSpend,
        netProfit,
        shippingRate,
        deliveryRate,
        returnRate,
        cpa,
        roas,
        aov,
    };
}

/**
 * Get order breakdown by wilaya (region)
 */
export function getWilayaBreakdown(orders: OrderRow[]): WilayaStat[] {
    const map = new Map<string, WilayaStat>();

    orders.forEach(order => {
        const wilaya = order.wilaya?.trim() || 'Unknown';

        if (!map.has(wilaya)) {
            map.set(wilaya, { wilaya, count: 0, revenue: 0, profit: 0, delivered: 0, returned: 0 });
        }

        const stat = map.get(wilaya)!;
        stat.count += 1;
        stat.revenue += order.prixDeVente;

        if (order.status === 'completed') {
            stat.profit += order.benficeNet;
            stat.delivered += 1;
        } else if (order.status === 'failed') {
            stat.returned += 1;
        }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/**
 * Get order status distribution
 */
export function getStatusDistribution(orders: OrderRow[]): StatusStat[] {
    const total = orders.length;
    if (total === 0) return [];

    const statusMap: Record<string, { label: string; count: number; color: string }> = {
        'completed': { label: 'Delivered', count: 0, color: '#10b981' },
        'shiped': { label: 'Shipped', count: 0, color: '#3b82f6' },
        'failed': { label: 'Returned', count: 0, color: '#ef4444' },
    };

    // Count known statuses
    let knownCount = 0;
    orders.forEach(order => {
        const status = order.status.toLowerCase();
        if (statusMap[status]) {
            statusMap[status].count += 1;
            knownCount += 1;
        }
    });

    // Pending/other = total - known
    const pendingCount = total - knownCount;

    const result: StatusStat[] = [];

    if (pendingCount > 0) {
        result.push({
            status: 'pending',
            label: 'Pending',
            count: pendingCount,
            percentage: (pendingCount / total) * 100,
            color: '#f59e0b',
        });
    }

    Object.entries(statusMap).forEach(([status, data]) => {
        if (data.count > 0) {
            result.push({
                status,
                label: data.label,
                count: data.count,
                percentage: (data.count / total) * 100,
                color: data.color,
            });
        }
    });

    return result.sort((a, b) => b.count - a.count);
}
