'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllProducts, fetchAdSpend, ProductData, AdSpendData } from '@/lib/sheets';
import { calculateKPIs, ProductKPI } from '@/lib/kpi';
import ProductCard from '@/components/ProductCard';
import DateFilter from '@/components/DateFilter';
import Navbar from '@/components/Navbar';

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
            {/* Replaced Header with Navbar Component */}
            <Navbar />

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
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                        <h2 className="text-2xl font-bold text-white">Overview</h2>
                        {lastRefresh && (
                            <p className="text-sm text-slate-400">
                                Data updated: {lastRefresh.toLocaleTimeString()}
                            </p>
                        )}
                    </div>

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
                        {/* Added: Global Metrics Average */}
                        <div className="mt-4 pt-4 border-t border-slate-700/30">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Global Shipping Rate</p>
                                    <p className="text-lg font-bold text-blue-400">
                                        {(() => {
                                            const totalCmd = kpis.reduce((sum, k) => sum + k.totalCommandes, 0);
                                            const totalBase = kpis.reduce((sum, k) => sum + k.totalShiped + k.totalLivree + k.totalRetour, 0);
                                            return totalCmd > 0 ? ((totalBase / totalCmd) * 100).toFixed(1) + '%' : '0%';
                                        })()}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Global Delivery Rate</p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        {(() => {
                                            const totalBase = kpis.reduce((sum, k) => sum + k.totalShiped + k.totalLivree + k.totalRetour, 0);
                                            const totalLivree = kpis.reduce((sum, k) => sum + k.totalLivree, 0);
                                            return totalBase > 0 ? ((totalLivree / totalBase) * 100).toFixed(1) + '%' : '0%';
                                        })()}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Global Return Rate</p>
                                    <p className="text-lg font-bold text-red-400">
                                        {(() => {
                                            const totalBase = kpis.reduce((sum, k) => sum + k.totalShiped + k.totalLivree + k.totalRetour, 0);
                                            const totalRetour = kpis.reduce((sum, k) => sum + k.totalRetour, 0);
                                            return totalBase > 0 ? ((totalRetour / totalBase) * 100).toFixed(1) + '%' : '0%';
                                        })()}
                                    </p>
                                </div>
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
