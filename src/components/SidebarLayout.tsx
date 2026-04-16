'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import DashboardProvider from '@/context/DashboardProvider';

const AUTH_KEY = 'ecom_dashboard_auth';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authed, setAuthed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(260);

    // Auth check
    useEffect(() => {
        const isAuth = localStorage.getItem(AUTH_KEY);
        if (isAuth !== 'true') {
            router.push('/');
        } else {
            setAuthed(true);
        }
    }, [router, pathname]);

    // Listen to sidebar width changes via CSS
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const sidebar = document.querySelector('aside');
            if (sidebar) {
                const width = sidebar.getBoundingClientRect().width;
                setSidebarWidth(width);
            }
        });

        const sidebar = document.querySelector('aside');
        if (sidebar) {
            observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
            setSidebarWidth(sidebar.getBoundingClientRect().width);
        }

        return () => observer.disconnect();
    }, [authed]);

    if (!authed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <DashboardProvider>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <Sidebar />
                <main
                    className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative"
                    style={{ marginLeft: `${sidebarWidth}px` }}
                >
                    <TopHeader />
                    <div className="flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </DashboardProvider>
    );
}
