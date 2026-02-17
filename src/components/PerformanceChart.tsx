'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { DailyStat } from '@/lib/analytics';
import { formatCurrency } from '@/lib/kpi';

interface PerformanceChartProps {
    data: DailyStat[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl z-50">
                    <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
                    <div className="space-y-1">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs font-medium text-slate-500 w-20">
                                    {entry.name}:
                                </span>
                                <span className="text-sm font-bold text-slate-900">
                                    {formatCurrency(entry.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Financial Performance</h3>
                <p className="text-sm text-slate-500">Ad Spend vs Net Profit vs Total Profit</p>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                            tickFormatter={(value) => {
                                if (!value) return '';
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dx={-10}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {/* Total Profit (Green) */}
                        <Line
                            type="monotone"
                            dataKey="profit"
                            name="Tot. Profit"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* Ad Spend (Red) */}
                        <Line
                            type="monotone"
                            dataKey="adSpend"
                            name="Ad Spend"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* Net Profit (Blue - Dashed?) */}
                        <Line
                            type="monotone"
                            dataKey="netProfit"
                            name="Net Profit"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
