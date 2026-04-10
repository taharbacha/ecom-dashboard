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

    // Initialize selected products to all when products load
    useEffect(() => {
        if (products.length > 0 && selectedProducts.length === 0) {
            setSelectedProducts(products.map(p => p.name));
        }
    }, [products]);

    // Helper to calculate specific product ad spend for KPI card
    const calculateProductAdSpend = (productName: string) => {
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

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

    // Calculate KPIs
    const kpis = useMemo(() => {
        if (products.length === 0) return [];
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        return products.map((product) =>
            calculateKPIs(
                product.name,
                product.orders,
                calculateProductAdSpend(product.name),
                startDateObj,
                endDateObj
            )
        );
    }, [products, adSpendRows, startDate, endDate]);

    // Daily stats for charts
    const dailyStats = useMemo(() => {
        if (products.length === 0) return [];
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        const dateFilteredProducts = products.map(p => ({
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
    }, [products, adSpendRows, startDate, endDate, selectedProducts]);

    // Global stats
    const globalStats = useMemo(() => {
        if (products.length === 0) return null;
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        const dateFilteredProducts = products.map(p => ({
            name: p.name,
            orders: filterOrdersByDate(p.orders, startDateObj, endDateObj)
        }));

        return getGlobalStats(dateFilteredProducts, adSpendRows, startDateObj, endDateObj, selectedProducts);
    }, [products, adSpendRows, startDate, endDate, selectedProducts]);

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 pb-16">
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
                        onClick={refetch}
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

            {/* Product Cards */}
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
    );
}
