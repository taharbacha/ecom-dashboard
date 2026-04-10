'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StatusStat } from '@/lib/analytics';

interface StatusChartProps {
    data: StatusStat[];
}

export default function StatusChart({ data }: StatusChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Order Status</h3>
                <p className="text-sm text-slate-400">No data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Order Status Distribution</h3>

            <div className="h-52 w-full relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="count"
                            nameKey="label"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any, name: string | undefined) => [`${value} orders`, name || '']}
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '13px',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold text-slate-700">
                        {data.reduce((sum, d) => sum + d.count, 0)}
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {data.map((entry) => (
                    <div key={entry.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-slate-600">{entry.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-800">{entry.count}</span>
                            <span className="text-xs text-slate-400 w-12 text-right">
                                {entry.percentage.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
