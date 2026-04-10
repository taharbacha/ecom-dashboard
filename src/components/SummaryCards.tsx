'use client';

import {
    BarChart3,
    TrendingUp,
    Truck,
    RotateCcw,
    DollarSign,
    Package,
    Target,
    Zap,
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
        },
        {
            title: 'CPA',
            value: formatCurrency(stats.cpa),
            subtitle: 'Cost / Delivered Order',
            icon: Target,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-100'
        },
        {
            title: 'ROAS',
            value: stats.roas.toFixed(2) + 'x',
            subtitle: 'Return on Ad Spend',
            icon: Zap,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-100'
        },
        {
            title: 'AOV',
            value: formatCurrency(stats.aov),
            subtitle: 'Avg Order Value',
            icon: BarChart3,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
            borderColor: 'border-cyan-100'
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className={`bg-white rounded-xl p-5 shadow-sm border ${card.borderColor} hover:shadow-md transition-shadow duration-200`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                                <Icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 mb-1">{card.title}</p>
                            <h3 className={`text-xl font-bold ${card.color}`}>{card.value}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
