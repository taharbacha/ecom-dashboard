'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ProductData, AdSpendRow } from '@/lib/sheets';
import { fetchAllProducts, fetchAdSpend } from '@/lib/db';

interface DashboardContextType {
    products: ProductData[];
    adSpendRows: AdSpendRow[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboardData() {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error('useDashboardData must be used within DashboardProvider');
    return ctx;
}

export default function DashboardProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [adSpendRows, setAdSpendRows] = useState<AdSpendRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [productsData, adSpendData] = await Promise.all([
                fetchAllProducts(),
                fetchAdSpend(),
            ]);
            setProducts(productsData);
            setAdSpendRows(adSpendData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return (
        <DashboardContext.Provider value={{ products, adSpendRows, loading, error, refetch }}>
            {children}
        </DashboardContext.Provider>
    );
}
