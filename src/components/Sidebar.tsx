'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PRODUCT_SHEETS } from '@/lib/sheets';
import {
    LayoutDashboard,
    List,
    LogOut,
    Package,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Settings,
    Moon,
    Sun,
    DollarSign
} from 'lucide-react';

export function productSlug(name: string): string {
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Basic dark mode sync
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            if (root.classList.contains('dark')) {
                setIsDarkMode(true);
            }
        }
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.remove('dark');
            setIsDarkMode(false);
        } else {
            root.classList.add('dark');
            setIsDarkMode(true);
        }
    };

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
                bg-white dark:bg-slate-900
                border-r border-slate-200 dark:border-slate-800
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-[72px]' : 'w-[260px]'}
            `}
        >
            {/* Brand */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white font-bold text-lg">E</span>
                </div>
                {!collapsed && (
                    <span className="text-base font-bold text-slate-800 dark:text-white tracking-tight whitespace-nowrap">
                        EcomDashboard
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 sidebar-scroll">
                <Link
                    href="/dashboard"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                        ${isActive('/dashboard')
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
                        }
                    `}
                    title="Dashboard"
                >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                <div className="pt-2">
                    <button
                        onClick={() => !collapsed && setProductsOpen(!productsOpen)}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                            ${pathname.startsWith('/product')
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
                            }
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

                    {(productsOpen || collapsed) && (
                        <div className={`${collapsed ? 'mt-1' : 'ml-4 mt-1 border-l border-slate-200 dark:border-slate-800 pl-3'} space-y-0.5`}>
                            {PRODUCT_SHEETS.map((product) => {
                                const slug = productSlug(product);
                                const active = isProductActive(slug);
                                return (
                                    <Link
                                        key={product}
                                        href={`/product/${slug}`}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                                            ${active
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/30'
                                            }
                                        `}
                                        title={product}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                        {!collapsed && <span className="truncate">{product}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Link
                    href="/all-orders"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                        ${isActive('/all-orders')
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
                        }
                    `}
                    title="Orders"
                >
                    <List className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Orders</span>}
                </Link>

                <Link
                    href="/ad-spend"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                        ${isActive('/ad-spend')
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
                        }
                    `}
                    title="AD SPEND"
                >
                    <DollarSign className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>AD SPEND</span>}
                </Link>

                <Link
                    href="/settings"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                        ${isActive('/settings')
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
                        }
                    `}
                    title="Settings"
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Settings</span>}
                </Link>
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex-shrink-0 space-y-1">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-semibold"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    {!collapsed && <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>
                
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-semibold"
                    title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {!collapsed && <span className="text-sm">Collapse</span>}
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-semibold"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
