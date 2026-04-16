'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDashboardData } from '@/context/DashboardProvider';
import { calculateKPIs, ProductKPI } from '@/lib/kpi';
import { getDailyStats, getGlobalStats, DailyStat, GlobalStats } from '@/lib/analytics';
import { filterOrdersByDate, AdSpendRow } from '@/lib/sheets';
import DateFilter from '@/components/DateFilter';
import SummaryCards from '@/components/SummaryCards';
import PerformanceChart from '@/components/PerformanceChart';
import AdSpendPanel from '@/components/AdSpendPanel';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';

export default function DashboardPage() {
    const { products, adSpendRows, loading, refetch } = useDashboardData();

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    
    // Feature Toggle: Analysis Mode
    // When true, nothing is shown initially (everything is 0) until products are actively selected.
    const [analysisMode, setAnalysisMode] = useState(false);

    // Initialize selected products to all when products load (if not in analysis mode)
    useEffect(() => {
        if (products.length > 0 && selectedProducts.length === 0 && !analysisMode) {
            setSelectedProducts(products.map(p => p.id));
        }
    }, [products, analysisMode]);

    // When toggling analysis mode, reset the selection.
    const handleAnalysisModeToggle = () => {
        setAnalysisMode(!analysisMode);
        if (!analysisMode) {
            // Turning ON: clear selection so stats drop to 0
            setSelectedProducts([]);
        } else {
            // Turning OFF: select all
            setSelectedProducts(products.map(p => p.id));
        }
    };

    // Helper to calculate specific product ad spend for KPI card
    const calculateProductAdSpend = (productId: string) => {
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        let total = 0;
        adSpendRows.forEach(row => {
            if (row.productId !== productId) return;

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

    // Calculate KPIs
    const kpis = useMemo(() => {
        if (products.length === 0) return [];
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        // If in analysis mode and no product is selected, optionally hide or zero them out.
        // We'll filter the KPI cards by selectedProducts so it visually makes sense.
        const relevantProducts = analysisMode && selectedProducts.length === 0 
            ? [] 
            : products.filter(p => !analysisMode || selectedProducts.includes(p.id));

        return relevantProducts.map((product) =>
            calculateKPIs(
                product.name,
                product.orders,
                calculateProductAdSpend(product.id),
                startDateObj,
                endDateObj
            )
        );
    }, [products, adSpendRows, startDate, endDate, selectedProducts, analysisMode]);

    // Daily stats for charts
    const dailyStats = useMemo(() => {
        if (products.length === 0 || (analysisMode && selectedProducts.length === 0)) return [];
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        const dateFilteredProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            orders: filterOrdersByDate(p.orders, startDateObj, endDateObj)
        }));

        let stats = getDailyStats(dateFilteredProducts, adSpendRows, selectedProducts);

        if (startDate || endDate) {
            stats = stats.filter(s => {
                if (startDate && s.date < startDate) return false;
                if (endDate && s.date > endDate) return false;
                return true;
            });
        }

        return stats;
    }, [products, adSpendRows, startDate, endDate, selectedProducts, analysisMode]);

    // Global stats
    const globalStats = useMemo(() => {
        if (products.length === 0) return null;
        
        // Zero state for strict Analysis Mode when nothing is selected
        if (analysisMode && selectedProducts.length === 0) {
            return {
                totalOrders: 0,
                totalShipped: 0,
                totalDelivered: 0,
                totalReturned: 0,
                totalRevenue: 0,
                totalProfit: 0,
                totalAdSpend: 0,
                netProfit: 0,
                shippingRate: 0,
                deliveryRate: 0,
                returnRate: 0,
                cpa: 0,
                roas: 0,
                aov: 0,
            };
        }

        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        const dateFilteredProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            orders: filterOrdersByDate(p.orders, startDateObj, endDateObj)
        }));

        return getGlobalStats(dateFilteredProducts, adSpendRows, startDateObj, endDateObj, selectedProducts);
    }, [products, adSpendRows, startDate, endDate, selectedProducts, analysisMode]);

    if (loading && products.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 pb-16 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Performance metrics and financial insights.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Mode Analyse Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={analysisMode}
                                onChange={handleAnalysisModeToggle}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${analysisMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${analysisMode ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mode Analyse</span>
                    </label>

                    <DateFilter
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onClear={() => { setStartDate(''); setEndDate(''); }}
                    />
                    <button
                        onClick={refetch}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        title="Refresh Data"
                    >
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Global Summary */}
            {globalStats && <SummaryCards stats={globalStats} />}

            {/* Product Filter & Charts */}
            {analysisMode && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fadeIn">
                    <ProductFilter
                        products={products.map(p => ({ id: p.id, name: p.name }))}
                        selectedProducts={selectedProducts}
                        onChange={setSelectedProducts}
                    />
                </div>
            )}

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

            {/* Product Cards */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    Individual Product Performance
                </h2>
                {kpis.length === 0 ? (
                    <div className="text-slate-500 p-6 text-center border overflow-hidden rounded-2xl border-slate-200 border-dashed">
                        {analysisMode ? 'Select products above to view their performance cards.' : 'No data available.'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {kpis.map((kpi) => (
                            <ProductCard key={kpi.productName} kpi={kpi} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
