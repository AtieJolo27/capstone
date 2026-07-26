import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface Props {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-dvh overflow-x-hidden bg-slate-50">
            <a
                href="#main-content"
                className="sr-only fixed left-4 top-4 z-[60] rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
                Skip to main content
            </a>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex min-h-dvh min-w-0 flex-col lg:pl-[17.5rem]">
                <Topbar
                    onMenuToggle={() => setSidebarOpen(true)}
                    isNavigationOpen={sidebarOpen}
                />

                <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
}
