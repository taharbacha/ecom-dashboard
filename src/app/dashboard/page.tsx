'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllProducts, fetchAdSpend, ProductData, AdSpendData, filterOrdersByDate } from '@/lib/sheets';
import { calculateKPIs, ProductKPI } from '@/lib/kpi';
import { getDailyStats, getGlobalStats, DailyStat, GlobalStats } from '@/lib/analytics';
import Navbar from '@/components/Navbar';
import DateFilter from '@/components/DateFilter';
import SummaryCards from '@/components/SummaryCards';
import DashboardCharts from '@/components/DashboardCharts';
import AdSpendPanel from '@/components/AdSpendPanel';
import ProductCard from '@/components/ProductCard';

const AUTH_KEY = 'ecom_dashboard_auth';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Data State
    const [products, setProducts] = useState<ProductData[]>([]);
    const [adSpend, setAdSpend] = useState<AdSpendData>({});

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Derived State
    const [kpis, setKpis] = useState<ProductKPI[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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
            setAdSpend(adSpendData);
            setLastRefresh(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate Aggregates & KPIs
    useEffect(() => {
        if (products.length === 0) return;

        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        // 1. Prepare filtered data for Global Stats & Charts
        const filteredProducts = products.map(p => ({
            name: p.name,
            orders: filterOrdersByDate(p.orders, startDateObj, endDateObj)
        }));

        setDailyStats(getDailyStats(filteredProducts));
        setGlobalStats(getGlobalStats(filteredProducts, adSpend));

        // 2. Calculate KPIs for individual Product Cards
        const calculatedKpis = products.map((product) =>
            calculateKPIs(
                product.name,
                product.orders,
                adSpend[product.name] || 0,
                startDateObj,
                endDateObj
            )
        );

        setKpis(calculatedKpis);
    }, [products, adSpend, startDate, endDate]);

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

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Top Controls (Overview Header & Refresh) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                        <p className="text-slate-500 text-sm">
                            {startDate && endDate
                                ? `Showing data from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                                : 'Showing all-time performance data'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
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

                {/* 1. Global Summary Cards */}
                {globalStats && <SummaryCards stats={globalStats} />}

                {/* 2. Charts Section & Ad Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart (2/3 width) */}
                    <div className="lg:col-span-2">
                        <DashboardCharts data={dailyStats} />
                    </div>

                    {/* Ad Spend Panel (1/3 width) */}
                    <div className="lg:col-span-1 h-full">
                        {globalStats && <AdSpendPanel stats={globalStats} />}
                    </div>
                </div>

                {/* 3. Product KPIs Grid */}
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Product Performance
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
