import { ShieldCheck, Sprout } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

const benefits = [
    'Review field conditions in one workspace.',
    'Respond to sensor alerts with clear context.',
    'Keep farm decisions organized and traceable.',
];

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[minmax(20rem,0.9fr)_minmax(32rem,1.1fr)]">
            <aside className="relative hidden overflow-hidden bg-[#144014] px-10 py-10 text-white lg:flex lg:flex-col xl:px-14 xl:py-14">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
                <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-lime-200/10 blur-3xl" />

                <div className="relative flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-100">
                        <Sprout className="h-6 w-6" />
                    </span>
                    <span>
                        <strong className="block text-lg tracking-tight">Geo-Pulse</strong>
                        <span className="mt-0.5 block text-xs text-emerald-100/70">
                            Farm operations
                        </span>
                    </span>
                </div>

                <div className="relative my-auto max-w-md py-16">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200/80">
                        Admin workspace
                    </p>
                    <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                        Field intelligence for confident daily decisions.
                    </h1>
                    <p className="mt-5 max-w-sm text-base leading-7 text-emerald-50/75">
                        A calm, focused workspace for monitoring farms, sensors,
                        recommendations, and field operations.
                    </p>

                    <ul className="mt-10 space-y-4">
                        {benefits.map((benefit) => (
                            <li key={benefit} className="flex items-start gap-3 text-sm text-emerald-50/85">
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_0_5px_rgba(110,231,183,0.12)]" />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-emerald-50/80">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-200" />
                    Your session is protected and managed securely by Geo-Pulse.
                </div>
            </aside>

            <main className="flex min-h-dvh min-w-0 items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
                <div className="w-full max-w-[27rem]">{children}</div>
            </main>
        </div>
    );
}
