import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
}: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            {/* soft background glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-100 opacity-40 blur-2xl transition group-hover:opacity-70" />

            <div className="relative flex items-center justify-between">

                {/* LEFT */}
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-800">
                        {value}
                    </h2>

                    {trend && (
                        <p className="mt-1 text-xs text-green-600">
                            {trend}
                        </p>
                    )}
                </div>

                {/* ICON */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#144014] to-[#1E5A1E] shadow-md transition group-hover:scale-110">
                    <Icon className="text-white" size={26} />
                </div>
            </div>
        </div>
    );
}