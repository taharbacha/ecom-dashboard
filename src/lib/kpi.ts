import { OrderRow, filterOrdersByDate } from './sheets';

export interface ProductKPI {
    productName: string;
    totalCommandes: number;      // ALL rows
    totalConfirmer: number;      // status === 'confirmer'
    totalLivree: number;         // status === 'completed'
    totalRetour: number;         // status === 'failed'
    tauxConfirmation: number;    // confirmer / commandes * 100
    tauxLivraison: number;       // ((livree/commandes) + (livree/confirmer)) / 2 * 100
    benficeTotal: number;        // SUM(Benfice net) WHERE status === 'completed'
    adSpend: number;             // From DASH sheet
    benficeFinal: number;        // benficeTotal - adSpend
}

export function calculateKPIs(
    productName: string,
    orders: OrderRow[],
    adSpend: number,
    startDate: Date | null = null,
    endDate: Date | null = null
): ProductKPI {
    // Filter by date if provided
    const filteredOrders = filterOrdersByDate(orders, startDate, endDate);

    // Calculate counts by status
    const totalCommandes = filteredOrders.length;
    const totalConfirmer = filteredOrders.filter(o => o.status === 'confirmer').length;
    const totalLivree = filteredOrders.filter(o => o.status === 'completed').length;
    const totalRetour = filteredOrders.filter(o => o.status === 'failed').length;

    // Calculate taux de confirmation
    const tauxConfirmation = totalCommandes > 0
        ? (totalConfirmer / totalCommandes) * 100
        : 0;

    // Calculate taux de livraison (average of two ratios)
    let tauxLivraison = 0;
    if (totalCommandes > 0 || totalConfirmer > 0) {
        const ratio1 = totalCommandes > 0 ? totalLivree / totalCommandes : 0;
        const ratio2 = totalConfirmer > 0 ? totalLivree / totalConfirmer : 0;

        // If both denominators are valid, average them
        if (totalCommandes > 0 && totalConfirmer > 0) {
            tauxLivraison = ((ratio1 + ratio2) / 2) * 100;
        } else if (totalCommandes > 0) {
            tauxLivraison = ratio1 * 100;
        } else if (totalConfirmer > 0) {
            tauxLivraison = ratio2 * 100;
        }
    }

    // Calculate benfice total (only for completed orders)
    const benficeTotal = filteredOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.benficeNet, 0);

    // Calculate benfice final
    const benficeFinal = benficeTotal - adSpend;

    return {
        productName,
        totalCommandes,
        totalConfirmer,
        totalLivree,
        totalRetour,
        tauxConfirmation,
        tauxLivraison,
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
