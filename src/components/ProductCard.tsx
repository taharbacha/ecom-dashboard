'use client';

import { ProductKPI, formatCurrency, formatPercent } from '@/lib/kpi';
import { Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

interface ProductCardProps {
    kpi: ProductKPI;
}

export default function ProductCard({ kpi }: ProductCardProps) {
    // Determine color status
    const isGoodDelivery = kpi.deliveryRate >= 70; // 70% threshold
    const isHighReturn = kpi.returnRate > 30;      // 30% threshold
    const isProfitable = kpi.benficeFinal > 0;

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between group-hover:bg-slate-50 transition-colors">
                <h3 className="font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                        <Package className="w-4 h-4" />
                    </span>
                    {kpi.productName}
                </h3>
                {/* Status Badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${isProfitable
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {isProfitable ? 'PROFITABLE' : 'LOSS'}
                </span>
            </div>

            <div className="p-6 space-y-6">

                {/* 1. Volume Metrics */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="h-px flex-1 bg-slate-100"></span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume</span>
                        <span className="h-px flex-1 bg-slate-100"></span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-slate-50">
                            <p className="text-[10px] text-slate-400 uppercase mb-1">Orders</p>
                            <p className="text-sm font-bold text-slate-700">{kpi.totalCommandes}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50">
                            <p className="text-[10px] text-blue-400 uppercase mb-1">Ship</p>
                            <p className="text-sm font-bold text-blue-700">{kpi.totalShiped}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50">
                            <p className="text-[10px] text-emerald-400 uppercase mb-1">Done</p>
                            <p className="text-sm font-bold text-emerald-700">{kpi.totalLivree}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-red-50">
                            <p className="text-[10px] text-red-400 uppercase mb-1">Return</p>
                            <p className="text-sm font-bold text-red-700">{kpi.totalRetour}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Performance Metrics */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="h-px flex-1 bg-slate-100"></span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance</span>
                        <span className="h-px flex-1 bg-slate-100"></span>
                    </div>

                    <div className="space-y-3">
                        {/* Delivery Rate Bar */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">Delivery Rate</span>
                                <span className={`font-bold ${isGoodDelivery ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {formatPercent(kpi.deliveryRate)}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${isGoodDelivery ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${Math.min(100, kpi.deliveryRate)}%` }}
                                />
                            </div>
                        </div>

                        {/* Return Rate Bar */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">Return Rate</span>
                                <span className={`font-bold ${isHighReturn ? 'text-red-500' : 'text-slate-600'}`}>
                                    {formatPercent(kpi.returnRate)}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${isHighReturn ? 'bg-red-500' : 'bg-slate-400'}`}
                                    style={{ width: `${Math.min(100, kpi.returnRate)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Financial Section */}
                <div className="pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Ad Spend</p>
                            <p className="text-sm font-medium text-orange-500">-{formatCurrency(kpi.adSpend)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">Net Profit</p>
                            <p className={`text-lg font-bold ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(kpi.benficeFinal)}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
