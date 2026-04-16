'use client';

import { Bell, User, ChevronDown } from 'lucide-react';

export default function TopHeader() {
    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-200">
            {/* Left side: Page Title / Logo text */}
            <div className="flex items-center">
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                    MERCH ECOM
                </h1>
            </div>

            {/* Right side: User controls */}
            <div className="flex items-center gap-4">
                {/* Optional Status change Dropdown */}
                <div className="relative group hidden sm:block">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Status: Active
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* Notification */}
                <button className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                {/* Avatar */}
                <button className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
                        Admin
                    </span>
                </button>
            </div>
        </header>
    );
}
