import { OrderRow, filterOrdersByDate } from './sheets';

export interface ProductKPI {
    productName: string;
    totalCommandes: number;      // ALL rows
    totalConfirmer: number;      // status === 'confirmer' (raw count)
    effectiveConfirmer: number;  // Max(totalConfirmer, totalLivree) - normalized for analytics
    totalLivree: number;         // status === 'completed'
    totalRetour: number;         // status === 'failed'
    tauxConfirmation: number;    // effectiveConfirmer / commandes * 100
    tauxLivraison: number;       // ((livree/commandes) + (livree/effectiveConfirmer)) / 2 * 100, capped at 100%
    tauxRetour: number;          // totalRetour / commandes * 100
    benficeTotal: number;        // SUM(Benfice net) WHERE status === 'completed'
    adSpend: number;             // From DASH sheet
    benficeFinal: number;        // benficeTotal - adSpend
}

/**
 * Calculate KPIs for a product with normalized business rules:
 * - completed ⊆ confirmer ⊆ commandes (enforced via effectiveConfirmer)
 * - All rates are guaranteed to be between 0% and 100%
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

    // Calculate counts by status
    const totalCommandes = filteredOrders.length;
    const totalConfirmer = filteredOrders.filter(o => o.status === 'confirmer').length;
    const totalLivree = filteredOrders.filter(o => o.status === 'completed').length;
    const totalRetour = filteredOrders.filter(o => o.status === 'failed').length;

    // BUSINESS RULE: Enforce completed ⊆ confirmer ⊆ commandes
    // If raw data violates this, normalize by using effectiveConfirmer
    const effectiveConfirmer = Math.max(totalConfirmer, totalLivree);

    // Calculate taux de confirmation (using effectiveConfirmer)
    // Guaranteed: 0 ≤ tauxConfirmation ≤ 100
    const tauxConfirmation = totalCommandes > 0
        ? Math.min(100, (effectiveConfirmer / totalCommandes) * 100)
        : 0;

    // Calculate taux de livraison (average of two ratios, capped at 100%)
    // Formula: ((livree/commandes) + (livree/effectiveConfirmer)) / 2
    // Guards: Never divide by zero, never exceed 100%
    let tauxLivraison = 0;
    if (totalLivree > 0) {
        const ratio1 = totalCommandes > 0 ? totalLivree / totalCommandes : 0;
        const ratio2 = effectiveConfirmer > 0 ? totalLivree / effectiveConfirmer : 0;

        // Average both ratios, cap at 100%
        tauxLivraison = Math.min(100, ((ratio1 + ratio2) / 2) * 100);
    }

    // Calculate taux de retour (NEW KPI)
    // Formula: totalRetour / totalCommandes * 100
    // Guaranteed: 0 ≤ tauxRetour ≤ 100
    const tauxRetour = totalCommandes > 0
        ? Math.min(100, (totalRetour / totalCommandes) * 100)
        : 0;

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
        effectiveConfirmer,
        totalLivree,
        totalRetour,
        tauxConfirmation,
        tauxLivraison,
        tauxRetour,
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
