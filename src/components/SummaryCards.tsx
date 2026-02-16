'use client';

import {
    BarChart3,
    TrendingUp,
    Truck,
    RotateCcw,
    DollarSign,
    Package
} from 'lucide-react';
import { GlobalStats } from '@/lib/analytics';
import { formatCurrency, formatPercent } from '@/lib/kpi';

interface SummaryCardsProps {
    stats: GlobalStats;
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
    const cards = [
        {
            title: 'Total Orders',
            value: stats.totalOrders.toLocaleString(),
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100'
        },
        {
            title: 'Shipping Rate',
            value: formatPercent(stats.shippingRate),
            icon: Truck,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-100'
        },
        {
            title: 'Delivery Rate',
            value: formatPercent(stats.deliveryRate),
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-100'
        },
        {
            title: 'Return Rate',
            value: formatPercent(stats.returnRate),
            icon: RotateCcw,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-100'
        },
        {
            title: 'Net Profit',
            value: formatCurrency(stats.netProfit),
            icon: DollarSign,
            color: stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
            bgColor: stats.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
            borderColor: stats.netProfit >= 0 ? 'border-emerald-100' : 'border-red-100',
            colSpan: 'md:col-span-2 lg:col-span-1'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className={`bg-white rounded-xl p-6 shadow-sm border ${card.borderColor} ${card.colSpan || ''} hover:shadow-md transition-shadow duration-200`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                <Icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            {/* Optional Sparkline placeholder or small indicator could go here */}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                            <h3 className={`text-2xl font-bold ${card.color}`}>{card.value}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
