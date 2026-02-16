'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function MetricsPage() {
    const router = useRouter();

    useEffect(() => {
        const isAuth = localStorage.getItem('ecom_dashboard_auth');
        if (isAuth !== 'true') {
            router.push('/');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">How Metrics Work</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Understanding the COD-Optimized KPI model used to track true e-commerce performance.
                    </p>
                </div>

                <div className="space-y-12">

                    {/* 1. Order Flow */}
                    <section className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
                        <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">1</span>
                            Order Process Flow
                        </h3>

                        <div className="flex flex-col items-center justify-center space-y-4 text-white font-medium">
                            <div className="bg-slate-700 px-6 py-3 rounded-xl border border-slate-600">
                                Order Created (Total Commandes)
                            </div>
                            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            <div className="bg-blue-500/20 text-blue-300 px-6 py-3 rounded-xl border border-blue-500/30">
                                Shiped
                            </div>
                            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            <div className="flex gap-8">
                                <div className="bg-emerald-500/20 text-emerald-300 px-6 py-3 rounded-xl border border-emerald-500/30">
                                    Completed (Delivered)
                                </div>
                                <div className="flex items-center text-slate-500">OR</div>
                                <div className="bg-red-500/20 text-red-300 px-6 py-3 rounded-xl border border-red-500/30">
                                    Failed (Returned)
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. KPI Explanations */}
                    <section className="grid md:grid-cols-2 gap-6">

                        {/* Shipping Rate */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 02-1-1H9m5 5h2a2 2 0 002-2v-3a2 2 0 00-2-2h-1" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-white">Shipping Rate</h3>
                            </div>
                            <p className="text-slate-400 mb-4 h-12">Measures operational progression. How many orders have left the warehouse?</p>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 font-mono text-sm text-blue-200 mb-4">
                                (shiped + completed + failed) / total commandes
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Example</p>
                                <p className="text-slate-300 text-sm">
                                    100 total orders. 80 are processed and sent.<br />
                                    <span className="text-blue-400 font-bold">Shipping Rate = 80%</span>
                                </p>
                            </div>
                        </div>

                        {/* Delivery Rate */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-32 h-32 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-white">Delivery Rate</h3>
                            </div>
                            <p className="text-slate-400 mb-4 h-12">The most important KPI. Measures true delivery success vs. attempted deliveries.</p>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 font-mono text-sm text-emerald-200 mb-4">
                                completed / (shiped + completed + failed)
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Example</p>
                                <p className="text-slate-300 text-sm">
                                    100 orders sent. 80 delivered, 20 returned.<br />
                                    <span className="text-emerald-400 font-bold">Delivery Rate = 80%</span>
                                </p>
                            </div>
                        </div>

                        {/* Return Rate */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-white">Return Rate</h3>
                            </div>
                            <p className="text-slate-400 mb-4 h-12">Measures refusal risk. High returns = wasted ad spend & shipping costs.</p>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 font-mono text-sm text-red-200 mb-4">
                                failed / (shiped + completed + failed)
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Example</p>
                                <p className="text-slate-300 text-sm">
                                    100 orders sent. 20 returned.<br />
                                    <span className="text-red-400 font-bold">Return Rate = 20%</span>
                                </p>
                            </div>
                        </div>

                        {/* Profitability */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-white">Benfice Final</h3>
                            </div>
                            <p className="text-slate-400 mb-4 h-12">Real profitability after accounting for advertisements.</p>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 font-mono text-sm text-amber-200 mb-4">
                                (Total Net Profit) - (Ad Spend)
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Example</p>
                                <p className="text-slate-300 text-sm">
                                    15,000 DZD Profit - 3,000 DZD Ads<br />
                                    <span className="text-amber-400 font-bold">Benfice Final = 12,000 DZD</span>
                                </p>
                            </div>
                        </div>

                    </section>

                </div>
            </main>
        </div>
    );
}
