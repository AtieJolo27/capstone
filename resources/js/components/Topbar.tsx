import { Link, router, usePage } from "@inertiajs/react";
import { Bell, LogOut, Map, Menu, Settings2 } from "lucide-react";
import type { Auth } from "@/types";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
    "/": { title: "Dashboard", subtitle: "Network-wide soil intelligence" },
    "/gis-map-view": { title: "GIS / Map View", subtitle: "Monitor deployed sensors across every farmland" },
    "/farmers": { title: "Farmer Management", subtitle: "Manage grower profiles and registered farm relationships" },
    "/farms": { title: "Farm Management", subtitle: "Manage registered fields and their sensor coverage" },
    "/sensors": { title: "Sensor Monitoring", subtitle: "Review live device health and latest field readings" },
    "/sensor-readings": { title: "Sensor Readings", subtitle: "Review and maintain recorded field telemetry" },
    "/crop-predictions": { title: "Crop Predictions", subtitle: "Review crop suitability recommendations from field data" },
    "/fertilizer-predictions": { title: "Fertilizer Plans", subtitle: "Manage fertilizer recommendations for field conditions" },
    "/threshold-settings": { title: "Threshold Settings", subtitle: "Set monitoring limits for farms and sensor devices" },
    "/historical-analytics": { title: "Historical Analytics", subtitle: "Explore soil trends and recommendation patterns" },
    "/alerts": { title: "Alert Center", subtitle: "Prioritize field conditions that need action" },
    "/announcements": { title: "Announcement System", subtitle: "Publish updates to connected farmers" },
    "/reports": { title: "Reports", subtitle: "Generate decision-ready agriculture reports" },
    "/settings": { title: "Settings", subtitle: "Manage your profile, notifications, and thresholds" },
    "/calibration": { title: "Calibration", subtitle: "Keep field sensors accurate and ready for use" },
};

interface TopbarProps {
    onMenuToggle?: () => void;
    isNavigationOpen?: boolean;
}

interface TopbarPageProps {
    auth: Auth;
    [key: string]: unknown;
}

export default function Topbar({ onMenuToggle, isNavigationOpen = false }: TopbarProps) {
    const { props, url } = usePage<TopbarPageProps>();
    const currentPath = url.split("?")[0];
    const meta = Object.entries(pageMeta).find(([path]) => (
        currentPath === path || (path !== "/" && currentPath.startsWith(`${path}/`))
    ))?.[1] ?? pageMeta["/"];
    const isMapView = currentPath === "/gis-map-view";
    const user = props.auth.user;
    const accountName = user?.name?.trim() || "Administrator";
    const accountInitials = accountName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "AD";

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
            <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        aria-label="Open navigation"
                        aria-expanded={isNavigationOpen}
                        className="shrink-0 rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                        <p className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">{meta.title}</p>
                        <p className="hidden truncate text-sm text-slate-500 md:block">{meta.subtitle}</p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    {!isMapView && (
                        <Link
                            href="/gis-map-view"
                            className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:inline-flex"
                        >
                            <Map className="h-4 w-4" />
                            <span className="hidden lg:inline">Open map</span>
                        </Link>
                    )}

                    <Link
                        href="/alerts"
                        aria-label="View alerts"
                        className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    </Link>

                        <Link
                            href="/settings"
                        aria-label="Open account settings"
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:pr-3"
                        >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">{accountInitials}</span>
                        <span className="hidden leading-tight sm:block">
                            <span className="block max-w-32 truncate text-sm font-semibold text-slate-700">{accountName}</span>
                            <span className="block text-xs text-slate-500">Account settings</span>
                        </span>
                        <Settings2 className="hidden h-4 w-4 text-slate-400 lg:block" />
                    </Link>

                    <button
                        type="button"
                        onClick={() => router.post("/logout")}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:px-3"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden xl:inline">Sign out</span>
                        <span className="sr-only xl:hidden">Sign out</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
