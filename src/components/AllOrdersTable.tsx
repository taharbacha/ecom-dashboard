'use client';

import { useState, useEffect } from 'react';
import { useDashboardData } from '@/context/DashboardProvider';
import { Search, Filter, Download, Plus, MoreVertical, Calendar, Info } from 'lucide-react';
import { OrderRow } from '@/lib/sheets';
import { updateSupplierPaymentStatus, getAllSupplierPaymentStatuses } from '@/lib/supplierPayments';

export interface AggregatedOrder extends OrderRow {
    productName: string;
}

const STATUS_TABS = ['All', 'New', 'Processing', 'Pending', 'Completed', 'Canceled', 'Failed', 'Retour', 'Expédié', 'Livré'];

export default function AllOrdersTable() {
    const { products, loading: dataLoading, error: dataError } = useDashboardData();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    
    // Advanced Filters
    const [filterOrderId, setFilterOrderId] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [filterFournisseur, setFilterFournisseur] = useState('ALL');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    const [supplierPayments, setSupplierPayments] = useState<Record<string, boolean>>({});
    const [loadingPayments, setLoadingPayments] = useState(true);

    useEffect(() => {
        getAllSupplierPaymentStatuses().then(statuses => {
            setSupplierPayments(statuses);
            setLoadingPayments(false);
        });
    }, []);

    const allOrders: AggregatedOrder[] = [];
    products.forEach(p => {
        p.orders.forEach(o => {
            allOrders.push({ ...o, productName: p.name });
        });
    });

    // Extracting unique product names for dropdown
    const availableProducts = Array.from(new Set(allOrders.map(o => o.productName))).filter(Boolean);

    const filteredOrders = allOrders.filter(order => {
        // Tab Status Filter (fuzzy matching common French/English statuses)
        if (activeTab !== 'All') {
            const rawStatus = (order.status || '').toLowerCase();
            const tab = activeTab.toLowerCase();
            
            // Map our UI tabs to potential raw statuses
            if (tab === 'new' && rawStatus !== 'new') return false;
            // E-com usually maps shipped to Processing/Expedié, and returned to Failed/Retour
            if (tab === 'processing' && !['processing', 'expédié', 'en cours'].includes(rawStatus)) return false;
            if (tab === 'pending' && !['pending'].includes(rawStatus)) return false;
            if (tab === 'completed' && !['completed', 'livré'].includes(rawStatus)) return false;
            if (tab === 'canceled' && !['canceled', 'annulé'].includes(rawStatus)) return false;
            if (tab === 'failed' && !['failed', 'retour'].includes(rawStatus)) return false;
            // Explicit status matches for existing French statuses
            if (['retour', 'expédié', 'livré'].includes(tab) && rawStatus !== tab) return false;
        }

        // Global Search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = (
                (order.ref && order.ref.toLowerCase().includes(lowerSearch)) ||
                (order.client && order.client.toLowerCase().includes(lowerSearch)) ||
                (order.num && order.num.toLowerCase().includes(lowerSearch))
            );
            if (!matchesSearch) return false;
        }

        // Advanced Filters
        if (filterOrderId && !order.ref?.toLowerCase().includes(filterOrderId.toLowerCase())) return false;
        if (filterProduct && order.productName !== filterProduct) return false;
        if (filterFournisseur !== 'ALL') {
            const isPaid = supplierPayments[order.ref] || false;
            if (filterFournisseur === 'PAID' && !isPaid) return false;
            if (filterFournisseur === 'UNPAID' && isPaid) return false;
        }
        if (filterDateFrom && new Date(order.date) < new Date(filterDateFrom)) return false;
        if (filterDateTo && new Date(order.date) > new Date(filterDateTo)) return false;

        return true;
    });

    const togglePaymentStatus = async (orderRef: string) => {
        const currentStatus = supplierPayments[orderRef] || false;
        const newStatus = !currentStatus;
        setSupplierPayments(prev => ({ ...prev, [orderRef]: newStatus }));
        const success = await updateSupplierPaymentStatus(orderRef, newStatus);
        if (!success) {
            setSupplierPayments(prev => ({ ...prev, [orderRef]: currentStatus }));
            console.error("Failed to save payment status");
        }
    };

    // UI Helpers
    const getStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (['paid', 'completed', 'livré'].includes(s)) {
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
        }
        if (['failed', 'canceled', 'annulé', 'retour'].includes(s)) {
            return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
        }
        if (['processing', 'expédié', 'en cours'].includes(s)) {
            return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
        }
        if (['pending'].includes(s)) {
            return 'bg-amber-100 text-amber-700 dark:bg-orange-500/10 dark:text-orange-400';
        }
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    };

    if (dataLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex gap-3 text-sm font-medium">
                <Info className="w-5 h-5" />
                <p>{dataError}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            {/* Header & Actions */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-6">
                
                {/* Search & Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by order ID or PHONE NUMBER..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                    </div>
                </div>

                {/* Advanced Filter Panel */}
                {showFilters && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Order ID</label>
                            <input 
                                type="text" 
                                value={filterOrderId}
                                onChange={(e) => setFilterOrderId(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Product</label>
                            <select 
                                value={filterProduct}
                                onChange={(e) => setFilterProduct(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                            >
                                <option value="">All Products</option>
                                {availableProducts.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Fournisseur</label>
                            <select 
                                value={filterFournisseur}
                                onChange={(e) => setFilterFournisseur(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                            >
                                <option value="ALL">All</option>
                                <option value="PAID">Paid</option>
                                <option value="UNPAID">Unpaid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Date From</label>
                            <input 
                                type="date" 
                                value={filterDateFrom}
                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Date To</label>
                            <input 
                                type="date" 
                                value={filterDateTo}
                                onChange={(e) => setFilterDateTo(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" 
                            />
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200 dark:border-slate-800 no-scrollbar pb-1">
                    {STATUS_TABS.map(tab => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap pb-3 text-sm font-semibold transition-colors relative ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                            >
                                {tab}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Order ID</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Customer</th>
                            <th className="px-6 py-4 font-semibold">Product</th>
                            <th className="px-6 py-4 font-semibold text-right">QTT</th>
                            <th className="px-6 py-4 font-semibold text-right">Price</th>
                            <th className="px-6 py-4 font-semibold text-center">Fournisseur</th>
                            <th className="px-6 py-4 font-semibold text-center">Status</th>
                            <th className="px-6 py-4 font-semibold text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                                    No orders found. Adjust your search or filters.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order, i) => {
                                const isPaid = supplierPayments[order.ref] || false;
                                return (
                                    <tr key={`${order.ref}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">{order.ref}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {order.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{order.client}</span>
                                                <span className="text-xs text-slate-500">{order.num}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{order.productName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{order.qtt}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-800 dark:text-slate-200">
                                            {order.prixDeVente} DZD
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => togglePaymentStatus(order.ref)}
                                                disabled={loadingPayments}
                                                className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-colors border ${
                                                    isPaid 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100' 
                                                    : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                {isPaid ? 'PAID' : 'UNPAID'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                                                {order.status || 'NEW'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                                            <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Minimal Pagination Placeholder */}
            {filteredOrders.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 flex justify-between items-center">
                    <span>Showing {filteredOrders.length} orders</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Previous</button>
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
