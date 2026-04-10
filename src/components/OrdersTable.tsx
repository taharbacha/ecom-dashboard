'use client';

import { useState, useMemo } from 'react';
import { OrderRow } from '@/lib/sheets';
import { formatCurrency } from '@/lib/kpi';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface OrdersTableProps {
    orders: OrderRow[];
}

type SortKey = 'ref' | 'date' | 'client' | 'wilaya' | 'qtt' | 'prixDeVente' | 'benficeNet' | 'status';
type SortDir = 'asc' | 'desc';

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Delivered' },
    shiped: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Shipped' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', label: 'Returned' },
};

export default function OrdersTable({ orders }: OrdersTableProps) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(0);
    const perPage = 15;

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
        setPage(0);
    };

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
            : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        let result = orders;

        if (q) {
            result = result.filter(o =>
                o.ref.toLowerCase().includes(q) ||
                o.client.toLowerCase().includes(q) ||
                o.wilaya.toLowerCase().includes(q) ||
                o.num.toLowerCase().includes(q) ||
                o.status.toLowerCase().includes(q)
            );
        }

        result = [...result].sort((a, b) => {
            let aVal: string | number = a[sortKey];
            let bVal: string | number = b[sortKey];

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [orders, search, sortKey, sortDir]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const pageData = filtered.slice(page * perPage, (page + 1) * perPage);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Orders</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{filtered.length} records</p>
                </div>

                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Search orders..."
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-64 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50/80">
                            {[
                                { key: 'ref' as SortKey, label: 'Ref' },
                                { key: 'date' as SortKey, label: 'Date' },
                                { key: 'client' as SortKey, label: 'Client' },
                                { key: 'wilaya' as SortKey, label: 'Wilaya' },
                                { key: 'qtt' as SortKey, label: 'Qty' },
                                { key: 'prixDeVente' as SortKey, label: 'Price' },
                                { key: 'benficeNet' as SortKey, label: 'Profit' },
                                { key: 'status' as SortKey, label: 'Status' },
                            ].map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => toggleSort(col.key)}
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        <SortIcon col={col.key} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {pageData.map((order, idx) => {
                            const badge = STATUS_BADGES[order.status] || {
                                bg: 'bg-amber-50',
                                text: 'text-amber-700',
                                label: order.status || 'Pending',
                            };
                            return (
                                <tr key={`${order.ref}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">{order.ref}</td>
                                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{order.date}</td>
                                    <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{order.client}</td>
                                    <td className="px-4 py-3 text-slate-500">{order.wilaya}</td>
                                    <td className="px-4 py-3 text-slate-600 font-medium">{order.qtt}</td>
                                    <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{formatCurrency(order.prixDeVente)}</td>
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                                        <span className={order.benficeNet >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                            {formatCurrency(order.benficeNet)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                                            {badge.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {pageData.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                    No orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                        Page {page + 1} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
