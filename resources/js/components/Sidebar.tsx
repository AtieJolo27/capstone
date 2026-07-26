import { Link, usePage } from "@inertiajs/react";
import {
    BellRing,
    Cpu,
    FileBarChart,
    FlaskConical,
    LayoutDashboard,
    Leaf,
    Map,
    MapPinned,
    Megaphone,
    ScrollText,
    Settings,
    SlidersHorizontal,
    Sprout,
    Users,
    Wrench,
    X,
} from "lucide-react";
import { useEffect } from "react";

const navigationSections = [
    {
        label: "Overview",
        items: [
            { title: "Dashboard", icon: LayoutDashboard, href: "/" },
            { title: "GIS / Map View", icon: Map, href: "/gis-map-view" },
        ],
    },
    {
        label: "Farm operations",
        items: [
            { title: "Farmer Management", icon: Users, href: "/farmers" },
            { title: "Farm Management", icon: MapPinned, href: "/farms" },
            { title: "Sensor Monitoring", icon: Cpu, href: "/sensors" },
            { title: "Sensor Readings", icon: ScrollText, href: "/sensor-readings" },
            { title: "Crop Predictions", icon: Leaf, href: "/crop-predictions" },
            { title: "Fertilizer Plans", icon: FlaskConical, href: "/fertilizer-predictions" },
            { title: "Calibration", icon: Wrench, href: "/calibration" },
        ],
    },
    {
        label: "Insights & communication",
        items: [
            { title: "Historical Analytics", icon: ScrollText, href: "/historical-analytics" },
            { title: "Alert Center", icon: BellRing, href: "/alerts" },
            { title: "Announcements", icon: Megaphone, href: "/announcements" },
            { title: "Reports", icon: FileBarChart, href: "/reports" },
            { title: "Threshold Settings", icon: SlidersHorizontal, href: "/threshold-settings" },
        ],
    },
    {
        label: "Administration",
        items: [{ title: "Settings", icon: Settings, href: "/settings" }],
    },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const { url } = usePage();
    const activePath = url.split("?")[0];

    useEffect(() => {
        if (!open) {
            return;
        }

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", closeOnEscape);

        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [onClose, open]);

    return (
        <>
            {open && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"
                />
            )}

            <aside
                aria-label="Main navigation"
                className={`fixed inset-y-0 left-0 z-50 w-[17.5rem] shrink-0 flex-col bg-[#144014] text-white shadow-2xl transition-transform duration-200 ease-out ${open ? "flex translate-x-0" : "hidden -translate-x-full"} lg:flex lg:h-dvh lg:translate-x-0 lg:shadow-none`}
            >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                    <Link
                        href="/"
                        className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#144014]"
                        onClick={onClose}
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/15">
                            <Sprout className="h-5 w-5 text-emerald-200" />
                        </span>
                        <span className="min-w-0">
                            <strong className="block truncate text-base tracking-tight">Geo-Pulse</strong>
                            <span className="mt-0.5 block truncate text-xs text-emerald-100/70">Farm operations</span>
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close navigation"
                        className="rounded-lg p-2 text-emerald-50 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Admin sections">
                    {navigationSections.map((section, sectionIndex) => (
                        <div key={section.label} className={sectionIndex === 0 ? "" : "mt-5"}>
                            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/55">
                                {section.label}
                            </p>
                            <div className="space-y-1">
                                {section.items.map(({ title, icon: Icon, href }) => {
                                    const active = href === '/'
                                        ? activePath === href
                                        : activePath === href || activePath.startsWith(`${href}/`);

                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            aria-current={active ? "page" : undefined}
                                            onClick={onClose}
                                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#144014] ${active
                                                ? "bg-white text-emerald-950 shadow-[0_6px_18px_rgba(0,0,0,0.16)]"
                                                : "text-emerald-50/85 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-emerald-700" : "text-emerald-200/85"}`} />
                                            <span className="truncate">{title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-white/10 px-4 py-4">
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <p className="text-xs text-emerald-100/75">System status</p>
                        <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-white">
                            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.12)]" />
                            All systems operational
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
