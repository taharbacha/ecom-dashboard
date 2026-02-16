'use client';

import { GlobalStats } from '@/lib/analytics';
import { formatCurrency } from '@/lib/kpi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AdSpendPanelProps {
    stats: GlobalStats;
}

export default function AdSpendPanel({ stats }: AdSpendPanelProps) {
    // Safe division to avoid NaN
    const cpdo = stats.totalDelivered > 0
        ? stats.totalAdSpend / stats.totalDelivered
        : 0;

    const roas = stats.totalAdSpend > 0
        ? stats.totalProfit / stats.totalAdSpend
        : 0;

    // Data for the donut chart (Profit vs Ad Spend)
    // Visualization: Ad Spend as a portion of Total Revenue generated (approximated here by total profit + ad spend = gross margin used for ads)
    // Or simpler: Compare Ad Spend vs Net Profit
    const chartData = [
        { name: 'Ad Spend', value: stats.totalAdSpend, color: '#f97316' }, // Orange
        { name: 'Net Profit', value: Math.max(0, stats.netProfit), color: '#10b981' }, // Emerald
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Financial Overview</h3>

            <div className="flex-1 flex flex-col justify-center">
                {/* Donut Chart */}
                <div className="h-48 w-full relative mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => {
                                    if (typeof value === 'number') return formatCurrency(value);
                                    return String(value);
                                }}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gross</span>
                        <span className="text-lg font-bold text-slate-700">
                            {formatCurrency(stats.totalProfit)}
                        </span>
                    </div>
                </div>

                {/* Metrics List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-500">Total Ad Spend</span>
                        <span className="font-bold text-orange-500">{formatCurrency(stats.totalAdSpend)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                        <span className="text-sm text-emerald-700">Net Profit</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(stats.netProfit)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="text-center p-3 border border-slate-100 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1">CPDO</p>
                            <p className="font-bold text-slate-700">{formatCurrency(cpdo)}</p>
                        </div>
                        <div className="text-center p-3 border border-slate-100 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1">ROAS</p>
                            <p className="font-bold text-slate-700">{roas.toFixed(2)}x</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
