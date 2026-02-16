'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { DailyStat } from '@/lib/analytics';
import { formatCurrency } from '@/lib/kpi';

interface DashboardChartsProps {
    data: DailyStat[];
}

type MetricType = 'orders' | 'delivered' | 'returned' | 'profit';

export default function DashboardCharts({ data }: DashboardChartsProps) {
    const [activeMetric, setActiveMetric] = useState<MetricType>('orders');

    const metrics = {
        orders: { label: 'Orders', color: '#3b82f6', fill: '#eff6ff' },    // Blue
        delivered: { label: 'Delivered', color: '#10b981', fill: '#ecfdf5' }, // Emerald
        returned: { label: 'Returns', color: '#ef4444', fill: '#fef2f2' },  // Red
        profit: { label: 'Profit', color: '#f59e0b', fill: '#fffbeb' },     // Amber
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                    <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: metrics[activeMetric].color }}
                        />
                        <span className="text-slate-900 font-bold text-lg">
                            {activeMetric === 'profit'
                                ? formatCurrency(payload[0].value)
                                : payload[0].value
                            }
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Performance Over Time</h3>
                    <p className="text-sm text-slate-500">Track key metrics trends</p>
                </div>

                <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
                    {(Object.keys(metrics) as MetricType[]).map((metric) => (
                        <button
                            key={metric}
                            onClick={() => setActiveMetric(metric)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeMetric === metric
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                }`}
                        >
                            {metrics[metric].label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`color${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={metrics[activeMetric].color} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={metrics[activeMetric].color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dx={-10}
                            tickFormatter={(value: any) =>
                                activeMetric === 'profit'
                                    ? `${Number(value) / 1000}k`
                                    : String(value)
                            }
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey={activeMetric}
                            stroke={metrics[activeMetric].color}
                            fillOpacity={1}
                            fill={`url(#color${activeMetric})`}
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
