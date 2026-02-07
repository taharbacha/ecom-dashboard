'use client';

import { ProductKPI, formatCurrency, formatPercent } from '@/lib/kpi';

interface ProductCardProps {
    kpi: ProductKPI;
}

export default function ProductCard({ kpi }: ProductCardProps) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-slate-700/50 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </span>
                    {kpi.productName}
                </h3>
            </div>

            {/* KPIs Grid */}
            <div className="p-6">
                {/* Order Counts */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Total Commandes */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                        <p className="text-slate-400 text-sm mb-1">Total Commandes</p>
                        <p className="text-2xl font-bold text-white">{kpi.totalCommandes}</p>
                    </div>

                    {/* Total Confirmer */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                        <p className="text-slate-400 text-sm mb-1">Total Confirmer</p>
                        <p className="text-2xl font-bold text-blue-400">{kpi.totalConfirmer}</p>
                    </div>

                    {/* Total Livrée */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                        <p className="text-slate-400 text-sm mb-1">Total Livrée</p>
                        <p className="text-2xl font-bold text-emerald-400">{kpi.totalLivree}</p>
                    </div>

                    {/* Total Retour */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                        <p className="text-slate-400 text-sm mb-1">Total Retour</p>
                        <p className="text-2xl font-bold text-red-400">{kpi.totalRetour}</p>
                    </div>
                </div>

                {/* Rate KPIs */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Taux de Confirmation */}
                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30 text-center">
                        <p className="text-slate-400 text-xs mb-1">Taux Confirmation</p>
                        <p className="text-xl font-bold text-amber-400">{formatPercent(kpi.tauxConfirmation)}</p>
                    </div>

                    {/* Taux de Livraison */}
                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30 text-center">
                        <p className="text-slate-400 text-xs mb-1">Taux Livraison</p>
                        <p className="text-xl font-bold text-purple-400">{formatPercent(kpi.tauxLivraison)}</p>
                    </div>

                    {/* Taux de Retour (NEW) */}
                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30 text-center">
                        <p className="text-slate-400 text-xs mb-1">Taux Retour</p>
                        <p className="text-xl font-bold text-rose-400">{formatPercent(kpi.tauxRetour)}</p>
                    </div>
                </div>

                {/* Financial Section */}
                <div className="pt-4 border-t border-slate-700/50">
                    <div className="grid grid-cols-1 gap-3">
                        {/* Benfice Total */}
                        <div className="flex justify-between items-center bg-emerald-500/10 rounded-xl px-4 py-3 border border-emerald-500/20">
                            <span className="text-slate-300">Benfice Total</span>
                            <span className="text-lg font-bold text-emerald-400">{formatCurrency(kpi.benficeTotal)}</span>
                        </div>

                        {/* Ad Spend */}
                        <div className="flex justify-between items-center bg-orange-500/10 rounded-xl px-4 py-3 border border-orange-500/20">
                            <span className="text-slate-300">Ad Spend</span>
                            <span className="text-lg font-bold text-orange-400">- {formatCurrency(kpi.adSpend)}</span>
                        </div>

                        {/* Benfice Final */}
                        <div className={`flex justify-between items-center rounded-xl px-4 py-4 border ${kpi.benficeFinal >= 0
                                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
                                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30'
                            }`}>
                            <span className="text-white font-semibold">Benfice Final</span>
                            <span className={`text-xl font-bold ${kpi.benficeFinal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(kpi.benficeFinal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
