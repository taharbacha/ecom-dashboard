'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PRODUCT_SHEETS } from '@/lib/sheets';
import {
    LayoutDashboard,
    Info,
    LogOut,
    Package,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

// Generate a slug from product name
export function productSlug(name: string): string {
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
}

// Reverse slug to product name
export function productFromSlug(slug: string): string | undefined {
    return PRODUCT_SHEETS.find(
        (p) => productSlug(p) === slug
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [productsOpen, setProductsOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('ecom_dashboard_auth');
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;
    const isProductActive = (slug: string) => pathname === `/product/${slug}`;

    return (
        <aside
            className={`
                fixed top-0 left-0 z-50 h-screen flex flex-col
                bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
                border-r border-slate-800/50
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-[72px]' : 'w-[260px]'}
            `}
        >
            {/* Brand */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800/50 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                    <span className="text-white font-bold text-lg">E</span>
                </div>
                {!collapsed && (
                    <span className="text-base font-bold text-white tracking-tight whitespace-nowrap animate-fadeIn">
                        EcomDashboard
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 sidebar-scroll">
                {/* Dashboard */}
                <Link
                    href="/dashboard"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${isActive('/dashboard')
                            ? 'bg-blue-500/10 text-blue-400 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }
                    `}
                    title="Dashboard"
                >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                {/* Products Section */}
                <div className="pt-2">
                    <button
                        onClick={() => !collapsed && setProductsOpen(!productsOpen)}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            text-slate-400 hover:text-white hover:bg-slate-800/50
                        `}
                        title="Products"
                    >
                        <Package className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                            <>
                                <span className="flex-1 text-left">Products</span>
                                {productsOpen ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </>
                        )}
                    </button>

                    {/* Product Links */}
                    {(productsOpen || collapsed) && (
                        <div className={`${collapsed ? 'mt-1' : 'ml-4 mt-1 border-l border-slate-800 pl-3'} space-y-0.5`}>
                            {PRODUCT_SHEETS.map((product) => {
                                const slug = productSlug(product);
                                const active = isProductActive(slug);
                                return (
                                    <Link
                                        key={product}
                                        href={`/product/${slug}`}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200
                                            ${active
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                                            }
                                        `}
                                        title={product}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                        {!collapsed && (
                                            <span className="truncate">{product}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Metrics */}
                <Link
                    href="/metrics"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${isActive('/metrics')
                            ? 'bg-blue-500/10 text-blue-400 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }
                    `}
                    title="Metrics"
                >
                    <Info className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Metrics</span>}
                </Link>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-slate-800/50 p-3 flex-shrink-0 space-y-2">
                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all text-sm"
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {!collapsed && <span>Collapse</span>}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
