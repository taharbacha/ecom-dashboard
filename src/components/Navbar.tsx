'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('ecom_dashboard_auth');
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-4 group">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-105">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-white">E-Commerce Dashboard</h1>
                        </Link>
                    </div>

                    {/* Navigation & Actions */}
                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                            <Link
                                href="/dashboard"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === '/dashboard'
                                        ? 'bg-slate-700 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/metrics"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === '/metrics'
                                        ? 'bg-slate-700 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                Metrics Explanation
                            </Link>
                        </nav>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20 text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
