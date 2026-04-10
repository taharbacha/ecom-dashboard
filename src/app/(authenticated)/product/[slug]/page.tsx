'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { productFromSlug } from '@/components/Sidebar';
import { useDashboardData } from '@/context/DashboardProvider';
import { calculateKPIs, formatCurrency, formatPercent } from '@/lib/kpi';
import { getDailyStats, getWilayaBreakdown, getStatusDistribution } from '@/lib/analytics';
import { filterOrdersByDate, AdSpendRow } from '@/lib/sheets';
import DateFilter from '@/components/DateFilter';
import PerformanceChart from '@/components/PerformanceChart';
import StatusChart from '@/components/StatusChart';
import WilayaBreakdown from '@/components/WilayaBreakdown';
import OrdersTable from '@/components/OrdersTable';
import {
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    TrendingUp,
    RotateCcw,
    Target,
    Zap,
    DollarSign,
    BarChart3,
} from 'lucide-react';

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;
    const productName = productFromSlug(slug);

    const { products, adSpendRows, loading } = useDashboardData();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Find this product's data
    const productData = useMemo(() => {
        return products.find(p => p.name === productName);
    }, [products, productName]);

    // Calculate proportional ad spend for this product in the date range
    const adSpend = useMemo(() => {
        if (!productName) return 0;
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
    }, [adSpendRows, productName, startDate, endDate]);

    // KPIs
    const kpi = useMemo(() => {
        if (!productData) return null;
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;
        return calculateKPIs(productData.name, productData.orders, adSpend, startDateObj, endDateObj);
    }, [productData, adSpend, startDate, endDate]);

    // Filtered orders for charts
    const filteredOrders = useMemo(() => {
        if (!productData) return [];
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;
        return filterOrdersByDate(productData.orders, startDateObj, endDateObj);
    }, [productData, startDate, endDate]);

    // Daily stats for this product only
    const dailyStats = useMemo(() => {
        if (!productData) return [];
        const filteredProduct = {
            name: productData.name,
            orders: filteredOrders,
        };
        let stats = getDailyStats([filteredProduct], adSpendRows, [productData.name]);

        if (startDate || endDate) {
            stats = stats.filter(s => {
                if (startDate && s.date < startDate) return false;
                if (endDate && s.date > endDate) return false;
                return true;
            });
        }
        return stats;
    }, [productData, filteredOrders, adSpendRows, startDate, endDate]);

    // Status distribution
    const statusData = useMemo(() => getStatusDistribution(filteredOrders), [filteredOrders]);

    // Wilaya breakdown
    const wilayaData = useMemo(() => getWilayaBreakdown(filteredOrders), [filteredOrders]);

    if (!productName) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <h2 className="text-lg font-bold text-red-700 mb-2">Product Not Found</h2>
                    <p className="text-red-500 text-sm">The product &ldquo;{slug}&rdquo; does not exist.</p>
                </div>
            </div>
        );
    }

    if (loading && !productData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Loading product data...</p>
                </div>
            </div>
        );
    }

    if (!kpi) return null;

    const isProfitable = kpi.benficeFinal > 0;

    return (
        <div className="p-6 lg:p-8 space-y-8 pb-16">
            {/* Hero Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{productName}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isProfitable
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {isProfitable ? '● PROFITABLE' : '● LOSS'}
                            </span>
                            <span className="text-sm text-slate-400">{kpi.totalCommandes} total orders</span>
                        </div>
                    </div>
                </div>

                <DateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onClear={() => { setStartDate(''); setEndDate(''); }}
                />
            </div>

            {/* KPI Cards — Row 1: Volume */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total Orders', value: kpi.totalCommandes.toString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { title: 'Shipped', value: kpi.totalShiped.toString(), icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                    { title: 'Delivered', value: kpi.totalLivree.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                    { title: 'Returned', value: kpi.totalRetour.toString(), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.title} className={`bg-white rounded-xl p-5 shadow-sm border ${card.border} hover:shadow-md transition-shadow`}>
                            <div className={`p-2.5 rounded-lg ${card.bg} w-fit mb-3`}>
                                <Icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <p className="text-xs font-medium text-slate-400 mb-1">{card.title}</p>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* KPI Cards — Row 2: Rates */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { title: 'Shipping Rate', value: formatPercent(kpi.shippingRate), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                    { title: 'Delivery Rate', value: formatPercent(kpi.deliveryRate), icon: CheckCircle2, color: kpi.deliveryRate >= 70 ? 'text-emerald-600' : 'text-amber-600', bg: kpi.deliveryRate >= 70 ? 'bg-emerald-50' : 'bg-amber-50', border: kpi.deliveryRate >= 70 ? 'border-emerald-100' : 'border-amber-100' },
                    { title: 'Return Rate', value: formatPercent(kpi.returnRate), icon: RotateCcw, color: kpi.returnRate > 30 ? 'text-red-600' : 'text-slate-600', bg: kpi.returnRate > 30 ? 'bg-red-50' : 'bg-slate-50', border: kpi.returnRate > 30 ? 'border-red-100' : 'border-slate-100' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.title} className={`bg-white rounded-xl p-5 shadow-sm border ${card.border} hover:shadow-md transition-shadow`}>
                            <div className={`p-2.5 rounded-lg ${card.bg} w-fit mb-3`}>
                                <Icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <p className="text-xs font-medium text-slate-400 mb-1">{card.title}</p>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* KPI Cards — Row 3: Advanced Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: 'CPA', subtitle: 'Cost/Acquisition', value: formatCurrency(kpi.cpa), icon: Target, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                    { title: 'ROAS', subtitle: 'Return on Ad Spend', value: kpi.roas.toFixed(2) + 'x', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                    { title: 'AOV', subtitle: 'Avg Order Value', value: formatCurrency(kpi.aov), icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
                    { title: 'Avg Profit', subtitle: 'Per Delivered Order', value: formatCurrency(kpi.avgProfitPerOrder), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.title} className={`bg-white rounded-xl p-5 shadow-sm border ${card.border} hover:shadow-md transition-shadow`}>
                            <div className={`p-2.5 rounded-lg ${card.bg} w-fit mb-3`}>
                                <Icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <p className="text-xs font-medium text-slate-400 mb-0.5">{card.title}</p>
                            <p className="text-[10px] text-slate-300 mb-1">{card.subtitle}</p>
                            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Financial Summary Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
                        <p className="text-lg font-bold text-slate-800">{formatCurrency(kpi.totalRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Gross Profit</p>
                        <p className="text-lg font-bold text-slate-800">{formatCurrency(kpi.benficeTotal)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Ad Spend</p>
                        <p className="text-lg font-bold text-orange-500">-{formatCurrency(kpi.adSpend)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Net Profit (Bénéfice Final)</p>
                        <p className={`text-xl font-bold ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(kpi.benficeFinal)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PerformanceChart data={dailyStats} />
                </div>
                <div>
                    <StatusChart data={statusData} />
                </div>
            </div>

            {/* Wilaya Breakdown */}
            <WilayaBreakdown data={wilayaData} />

            {/* Orders Table */}
            <OrdersTable orders={filteredOrders} />
        </div>
    );
}
