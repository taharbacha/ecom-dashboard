'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllProducts, fetchAdSpend, ProductData, AdSpendRow, filterOrdersByDate } from '@/lib/sheets';
import { calculateKPIs, ProductKPI } from '@/lib/kpi';
import { getDailyStats, getGlobalStats, DailyStat, GlobalStats } from '@/lib/analytics';
import Navbar from '@/components/Navbar';
import DateFilter from '@/components/DateFilter';
import SummaryCards from '@/components/SummaryCards';
import PerformanceChart from '@/components/PerformanceChart';
import AdSpendPanel from '@/components/AdSpendPanel';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';

const AUTH_KEY = 'ecom_dashboard_auth';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // RAW Data State
    const [products, setProducts] = useState<ProductData[]>([]);
    const [adSpendRows, setAdSpendRows] = useState<AdSpendRow[]>([]);

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    // Derived State
    const [kpis, setKpis] = useState<ProductKPI[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);

    // Check authentication
    useEffect(() => {
        const isAuth = localStorage.getItem(AUTH_KEY);
        if (isAuth !== 'true') {
            router.push('/');
        }
    }, [router]);

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [productsData, adSpendData] = await Promise.all([
                fetchAllProducts(),
                fetchAdSpend(),
            ]);
            setProducts(productsData);
            setAdSpendRows(adSpendData);

            // Initialize selected products to all
            if (selectedProducts.length === 0) {
                setSelectedProducts(productsData.map(p => p.name));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Recalculate logic
    useEffect(() => {
        if (products.length === 0) return;

        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        // Filter logic is slightly different now:
        // 1. We filter orders by date FIRST for KPIs and Aggregates.
        // 2. We filter by PRODUCT for Aggregates (Charts/Global).

        // For Product Cards (KPIs):
        // - We calculate KPI for ALL products (so card exists), but data inside uses date filter.
        // - Ad spend for specific product card: we need to sum proportional spend for that product in range.

        // Helper to calculate specific product ad spend for KPI card
        const calculateProductAdSpend = (productName: string) => {
            let total = 0;
            adSpendRows.forEach(row => {
                if (row.product !== productName) return;

                const rowFrom = new Date(row.from);
                const rowTo = new Date(row.to);

                let overlapStart = rowFrom;
                let overlapEnd = rowTo;

                if (startDateObj && startDateObj > rowFrom) overlapStart = startDateObj;
                if (endDateObj && endDateObj < rowTo) overlapEnd = endDateObj;

                if (overlapStart <= overlapEnd) {
                    const overlapDiff = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
                    const overlapDays = Math.ceil(overlapDiff / (1000 * 60 * 60 * 24)) + 1;

                    const totalDiff = Math.abs(rowTo.getTime() - rowFrom.getTime());
                    const totalPeriodDays = Math.ceil(totalDiff / (1000 * 60 * 60 * 24)) + 1;

                    if (totalPeriodDays > 0) {
                        total += (overlapDays / totalPeriodDays) * row.amountDZD;
                    }
                }
            });
            return total;
        };

        // Calculate Product KPIs
        const calculatedKpis = products.map((product) =>
            calculateKPIs(
                product.name,
                product.orders,
                calculateProductAdSpend(product.name),
                startDateObj,
                endDateObj
            )
        );
        setKpis(calculatedKpis);

        // Calculate Global Stats & Charts (Respecting Product Filter)
        // We pass raw filtered-by-date orders to analytics? 
        // Actually `getDailyStats` and `getGlobalStats` in updated analytics.ts
        // take raw products and handle product selection internally.
        // BUT they don't filter orders by date internally (except `getGlobalStats` rates?).
        // Wait, my `analytics.ts` `getDailyStats` iterates orders but doesn't check order date vs range!
        // I need to filter orders by date range BEFORE passing to `getDailyStats`.

        // Let's create `dateFilteredProducts`
        const dateFilteredProducts = products.map(p => ({
            name: p.name,
            orders: filterOrdersByDate(p.orders, startDateObj, endDateObj)
        }));

        // For `getDailyStats`, if we pass filtered orders, the chart will only show days with orders.
        // But we also want to show days with Ad Spend even if no orders!
        // So we should pass Date Range to `getDailyStats` to fill empty days?
        // User requirement: "Generate daily data between selected dates."
        // If no date selected, what to do? Show all available data range?

        // Let's rely on data-driven range for now (showing days where stuff happened).
        // Or improved: filter `dailyStats` by range after generation if explicit range set?

        let stats = getDailyStats(dateFilteredProducts, adSpendRows, selectedProducts);

        // Filter stats by date range explicitly if set (to trim edges or show empty days?)
        // If user selects range, we only want to see that range on chart.
        if (startDate || endDate) {
            stats = stats.filter(s => {
                const d = new Date(s.date);
                if (startDateObj && d < startDateObj) return false;
                // endDateObj comparison: need to include the end date day fully
                // d <= endDateObj works if times are aligned.
                // Safe string comparison
                if (startDate && s.date < startDate) return false;
                if (endDate && s.date > endDate) return false;
                return true;
            });
        }

        setDailyStats(stats);

        setGlobalStats(getGlobalStats(
            dateFilteredProducts, // orders are filtered by date
            adSpendRows, // ad spend rows (full)
            startDateObj, // range for ad spend calc
            endDateObj,
            selectedProducts
        ));

    }, [products, adSpendRows, startDate, endDate, selectedProducts]);


    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header & Controls */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Performance metrics and financial insights.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <DateFilter
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                            onClear={() => { setStartDate(''); setEndDate(''); }}
                        />
                        <button
                            onClick={fetchData}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                            title="Refresh Data"
                        >
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>
                </div>

                {/* Global Summary */}
                {globalStats && <SummaryCards stats={globalStats} />}

                {/* Product Filter & Charts */}
                <div className="flex flex-col gap-6">
                    <ProductFilter
                        products={products.map(p => p.name)}
                        selectedProducts={selectedProducts}
                        onChange={setSelectedProducts}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Performance Chart (2/3) */}
                        <div className="lg:col-span-2">
                            <PerformanceChart data={dailyStats} />
                        </div>

                        {/* Ad Spend Breakdown (1/3) */}
                        <div className="lg:col-span-1 h-full">
                            {globalStats && <AdSpendPanel stats={globalStats} />}
                        </div>
                    </div>
                </div>

                {/* Product Cards (Always visible, but data reflects date filter) */}
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Individual Product Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {kpis.map((kpi) => (
                            <ProductCard key={kpi.productName} kpi={kpi} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
