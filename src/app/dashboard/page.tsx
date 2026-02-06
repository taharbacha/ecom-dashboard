'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllProducts, fetchAdSpend, ProductData, AdSpendData } from '@/lib/sheets';
import { calculateKPIs, ProductKPI } from '@/lib/kpi';
import ProductCard from '@/components/ProductCard';
import DateFilter from '@/components/DateFilter';

const AUTH_KEY = 'ecom_dashboard_auth';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [adSpend, setAdSpend] = useState<AdSpendData>({});
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [kpis, setKpis] = useState<ProductKPI[]>([]);
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

    // Calculate KPIs whenever products, adSpend, or date filters change
    useEffect(() => {
        if (products.length === 0) return;

        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

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

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem(AUTH_KEY);
        router.push('/');
    };

    // Clear date filters
    const handleClearDates = () => {
        setStartDate('');
        setEndDate('');
    };

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">E-Commerce Dashboard</h1>
                                {lastRefresh && (
                                    <p className="text-sm text-slate-400">
                                        Last updated: {lastRefresh.toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50"
                            >
                                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{error}</p>
                    </div>
                )}

                {/* Date Filter */}
                <div className="mb-8">
                    <DateFilter
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onClear={handleClearDates}
                    />
                </div>

                {/* Products Grid */}
                {kpis.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {kpis.map((kpi) => (
                            <ProductCard key={kpi.productName} kpi={kpi} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-xl font-semibold text-slate-400 mb-2">No Products Found</h3>
                        <p className="text-slate-500">Could not load product data from Google Sheets.</p>
                    </div>
                )}

                {/* Summary Stats */}
                {kpis.length > 0 && (
                    <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Summary (All Products)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <p className="text-slate-400 text-sm mb-1">Total Orders</p>
                                <p className="text-2xl font-bold text-white">
                                    {kpis.reduce((sum, k) => sum + k.totalCommandes, 0)}
                                </p>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <p className="text-slate-400 text-sm mb-1">Total Delivered</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {kpis.reduce((sum, k) => sum + k.totalLivree, 0)}
                                </p>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <p className="text-slate-400 text-sm mb-1">Total Returns</p>
                                <p className="text-2xl font-bold text-red-400">
                                    {kpis.reduce((sum, k) => sum + k.totalRetour, 0)}
                                </p>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <p className="text-slate-400 text-sm mb-1">Net Profit</p>
                                <p className={`text-2xl font-bold ${kpis.reduce((sum, k) => sum + k.benficeFinal, 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {new Intl.NumberFormat('fr-DZ').format(kpis.reduce((sum, k) => sum + k.benficeFinal, 0))} DZD
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-800 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-slate-500 text-sm">
                        E-Commerce Analytics Dashboard • Data from Google Sheets
                    </p>
                </div>
            </footer>
        </div>
    );
}
