'use client';

import { useState, useEffect } from 'react';
import { useDashboardData } from '@/context/DashboardProvider';
import { Search, Info, CheckCircle2, Circle } from 'lucide-react';
import { OrderRow } from '@/lib/sheets';
import { updateSupplierPaymentStatus, getAllSupplierPaymentStatuses } from '@/lib/supplierPayments';

// We extend OrderRow to include the product name so we know where it came from
export interface AggregatedOrder extends OrderRow {
    productName: string;
}

export default function AllOrdersTable() {
    const { products, loading: dataLoading, error: dataError } = useDashboardData();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [supplierPayments, setSupplierPayments] = useState<Record<string, boolean>>({});
    const [loadingPayments, setLoadingPayments] = useState(true);

    // Fetch initial payments status
    useEffect(() => {
        getAllSupplierPaymentStatuses().then(statuses => {
            setSupplierPayments(statuses);
            setLoadingPayments(false);
        });
    }, []);

    // Flatten all orders
    const allOrders: AggregatedOrder[] = [];
    products.forEach(p => {
        p.orders.forEach(o => {
            allOrders.push({ ...o, productName: p.name });
        });
    });

    // Unique statuses for filter dropdown
    const availableStatuses = Array.from(new Set(allOrders.map(o => o.status))).filter(Boolean);

    // Apply filters
    const filteredOrders = allOrders.filter(order => {
        // Status Filter
        if (statusFilter !== 'ALL' && order.status !== statusFilter) {
            return false;
        }

        // Search Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            return (
                (order.ref && order.ref.toLowerCase().includes(lowerSearch)) ||
                (order.client && order.client.toLowerCase().includes(lowerSearch)) ||
                (order.wilaya && order.wilaya.toLowerCase().includes(lowerSearch)) ||
                (order.num && order.num.toLowerCase().includes(lowerSearch)) ||
                (order.productName && order.productName.toLowerCase().includes(lowerSearch))
            );
        }
        return true;
    });

    const togglePaymentStatus = async (orderRef: string) => {
        const currentStatus = supplierPayments[orderRef] || false;
        const newStatus = !currentStatus;

        // Optimistic UI update
        setSupplierPayments(prev => ({ ...prev, [orderRef]: newStatus }));

        // Actual save
        const success = await updateSupplierPaymentStatus(orderRef, newStatus);

        // Revert if failed
        if (!success) {
            setSupplierPayments(prev => ({ ...prev, [orderRef]: currentStatus }));
            console.error("Failed to save payment status");
        }
    };

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                <Info className="w-5 h-5" />
                <p>{dataError}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-white/5 space-y-6">

                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ref, client, phone, or product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full glass-card border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-slate-800/40"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="glass-card border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-slate-800/40"
                        >
                            <option value="ALL">All Statuses</option>
                            {availableStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/10 bg-slate-900/30">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">Supplier Paid</th>
                                    <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">Product</th>
                                    <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">Ref</th>
                                    <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">Client</th>
                                    <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">Wilaya</th>
                                    <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap text-right">Qtt</th>
                                    <th className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                            No orders found matching your criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order, i) => {
                                        const isPaid = supplierPayments[order.ref] || false;
                                        return (
                                            <tr key={`${order.ref}-${i}`} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <button
                                                        onClick={() => togglePaymentStatus(order.ref)}
                                                        disabled={loadingPayments}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isPaid
                                                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                                            }`}
                                                        title={isPaid ? "Mark as unpaid" : "Mark as paid to supplier"}
                                                    >
                                                        {isPaid ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span className="text-xs font-bold">PAID</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Circle className="w-4 h-4" />
                                                                <span className="text-xs">UNPAID</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs font-semibold">
                                                        {order.productName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-medium text-white whitespace-nowrap">{order.ref}</td>
                                                <td className="px-6 py-3 text-slate-400 whitespace-nowrap">{order.date}</td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-white">{order.client}</span>
                                                        <span className="text-slate-500 text-xs">{order.num}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-slate-400 whitespace-nowrap">{order.wilaya}</td>
                                                <td className="px-6 py-3 text-right font-medium text-white whitespace-nowrap">{order.qtt}</td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <span className={`
                                                        px-3 py-1 rounded-full text-xs font-semibold border
                                                        ${order.status === 'Livré' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                                                        ${order.status === 'Retour' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                                                        ${order.status === 'Expédié' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                                                        ${!['Livré', 'Retour', 'Expédié'].includes(order.status) ? 'bg-slate-800 text-slate-300 border-slate-700' : ''}
                                                    `}>
                                                        {order.status || 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
