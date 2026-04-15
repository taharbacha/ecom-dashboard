'use client';

import { List } from 'lucide-react';
import AllOrdersTable from '@/components/AllOrdersTable';

export default function AllOrdersPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <List className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">All Orders</h1>
                    </div>
                    <p className="text-slate-400 text-sm">
                        View, search, and manage all your orders across all products.
                    </p>
                </div>
            </header>

            <AllOrdersTable />
        </div>
    );
}
