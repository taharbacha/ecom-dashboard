'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WilayaStat } from '@/lib/analytics';
import { formatCurrency } from '@/lib/kpi';

interface WilayaBreakdownProps {
    data: WilayaStat[];
    maxItems?: number;
}

export default function WilayaBreakdown({ data, maxItems = 10 }: WilayaBreakdownProps) {
    const topData = data.slice(0, maxItems);

    if (topData.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Top Wilayas</h3>
                <p className="text-sm text-slate-400">No data available</p>
            </div>
        );
    }

    const maxCount = Math.max(...topData.map(d => d.count));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload as WilayaStat;
            return (
                <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xl text-sm">
                    <p className="font-bold text-slate-800 mb-2">{d.wilaya}</p>
                    <div className="space-y-1 text-slate-600">
                        <p>Orders: <span className="font-semibold text-slate-800">{d.count}</span></p>
                        <p>Revenue: <span className="font-semibold text-slate-800">{formatCurrency(d.revenue)}</span></p>
                        <p>Delivered: <span className="font-semibold text-emerald-600">{d.delivered}</span></p>
                        <p>Returned: <span className="font-semibold text-red-500">{d.returned}</span></p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Top Wilayas</h3>
                    <p className="text-xs text-slate-400 mt-1">By order count</p>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                    {data.length} wilayas
                </span>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={topData}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="wilaya"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            width={90}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                            {topData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`hsl(217, ${60 + (entry.count / maxCount) * 30}%, ${55 - (entry.count / maxCount) * 15}%)`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
