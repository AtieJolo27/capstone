import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sprout } from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import FlashMessages from '@/components/FlashMessages';
import AuthLayout from '@/layouts/AuthLayout';

interface LoginFormData {
    email: string;
    password: string;
}

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm<LoginFormData>({
        email: '',
        password: '',
    });

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Admin sign in" />

            <div className="mb-8 flex items-center gap-3 lg:hidden">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                    <Sprout className="h-6 w-6" />
                </span>
                <span>
                    <strong className="block text-lg tracking-tight text-slate-950">Geo-Pulse</strong>
                    <span className="mt-0.5 block text-xs text-slate-500">Farm operations</span>
                </span>
            </div>

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-950/[0.04] sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <LockKeyhole className="h-5 w-5" />
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Admin access
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    Welcome back
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                    Sign in with your existing administrator account to continue to
                    the Geo-Pulse workspace.
                </p>

                <div className="mt-6">
                    <FlashMessages />
                </div>

                <form className="mt-6 space-y-5" onSubmit={submit}>
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className={`${inputClassName} pl-10 ${form.errors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                placeholder="you@example.com"
                                autoComplete="username"
                                autoFocus
                                required
                                disabled={form.processing}
                                aria-invalid={Boolean(form.errors.email)}
                                aria-describedby={form.errors.email ? 'email-error' : undefined}
                            />
                        </div>
                        {form.errors.email ? (
                            <p id="email-error" className="mt-2 text-sm font-medium text-rose-700">
                                {form.errors.email}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-800">
                            Password
                        </label>
                        <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className={`${inputClassName} px-10 ${form.errors.password ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                disabled={form.processing}
                                aria-invalid={Boolean(form.errors.password)}
                                aria-describedby={form.errors.password ? 'password-error' : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.errors.password ? (
                            <p id="password-error" className="mt-2 text-sm font-medium text-rose-700">
                                {form.errors.password}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        {form.processing ? 'Signing in…' : 'Sign in to admin panel'}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs leading-5 text-slate-500">
                    For security, your session expires after a period of inactivity.
                    Contact the system administrator if you cannot access your account.
                </p>
            </section>
        </AuthLayout>
    );
}
