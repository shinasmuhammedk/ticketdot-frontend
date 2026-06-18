import React, { useState } from 'react';
import { Mail, Lock, Bus, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();

    const validate = () => {
        const next = {};

        if (!email.trim()) {
            next.email = 'Enter your email address';
        } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            next.email = 'Enter a valid email address';
        }

        if (!password) {
            next.password = 'Enter your password';
        }

        return next;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setIsLoading(true);
        setApiError('');
        try {
            const res = await loginApi({ email, password });
            // Backend should return { token: '...' } – adjust key if different
            const token = res.data.token || res.data.access_token;
            if (token) localStorage.setItem('token', token);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.';
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-stone-50">
            {/* Brand panel — hidden on small screens, shown from md up */}
            <div className="hidden md:flex md:w-[44%] lg:w-[40%] relative bg-[#101F33] text-white flex-col justify-between overflow-hidden">
                {/* Route-line texture */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                <div className="relative z-10 px-10 pt-12">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E8A33D]">
                            <Bus size={20} className="text-[#101F33]" strokeWidth={2.25} />
                        </div>
                        <span className="text-xl font-semibold tracking-tight">TicketDot</span>
                    </div>
                </div>

                <div className="relative z-10 px-10 py-12">
                    <h1 className="text-[2.1rem] leading-[1.15] font-semibold tracking-tight max-w-sm">
                        Every seat, every route, booked in under a minute.
                    </h1>
                    <p className="mt-4 text-[15px] text-white/60 max-w-sm leading-relaxed">
                        Sign in to manage your bookings, track live departures, and check in
                        without printing a thing.
                    </p>

                    <div className="mt-10 flex items-center gap-3 text-white/50 text-sm">
                        <ShieldCheck size={16} className="text-[#E8A33D]" />
                        <span>Bank-grade encryption on every transaction</span>
                    </div>
                </div>

                {/* Ticket stub edge */}
                <div className="relative z-10 h-px w-full">
                    <div className="absolute -bottom-3 left-0 w-full flex items-center">
                        <div className="flex-1 border-t border-dashed border-white/20" />
                    </div>
                    <div className="absolute -bottom-[7px] -left-[7px] w-3.5 h-3.5 rounded-full bg-stone-50" />
                    <div className="absolute -bottom-[7px] -right-[7px] w-3.5 h-3.5 rounded-full bg-stone-50 md:hidden" />
                </div>
            </div>

            {/* Form panel */}
            <div className="flex-1 flex flex-col">
                {/* Compact mobile header, replaces the brand panel on small screens */}
                <div className="md:hidden flex items-center gap-2.5 px-6 pt-8">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#101F33]">
                        <Bus size={18} className="text-[#E8A33D]" strokeWidth={2.25} />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-[#101F33]">
                        TicketDot
                    </span>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-10 sm:py-16">
                    <div className="w-full max-w-[400px]">
                        <div className="mb-8">
                            <h2 className="text-[1.65rem] font-semibold tracking-tight text-stone-900">
                                Welcome back
                            </h2>
                            <p className="mt-1.5 text-[15px] text-stone-500">
                                Sign in to continue to your account.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} noValidate className="space-y-5">
                            {/* Email field */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-stone-700 mb-1.5"
                                >
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                                        }}
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                        className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-white text-[15px] text-stone-900 placeholder:text-stone-400 outline-none transition-colors
                      ${errors.email
                                                ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                                                : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                                            }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p id="email-error" className="mt-1.5 text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password field */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                                        Password
                                    </label>
                                    <a href="#" className="text-sm font-medium text-[#101F33] hover:text-[#E8A33D] transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                    />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                                        }}
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={errors.password ? 'password-error' : undefined}
                                        className={`w-full h-12 pl-11 pr-11 rounded-xl border bg-white text-[15px] text-stone-900 placeholder:text-stone-400 outline-none transition-colors
                      ${errors.password
                                                ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                                                : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p id="password-error" className="mt-1.5 text-sm text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember me */}
                            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 rounded border-stone-300 text-[#101F33] focus:ring-[#101F33]/20"
                                />
                                <span className="text-sm text-stone-600">Remember me on this device</span>
                            </label>

                            {/* API Error */}
                            {apiError && (
                                <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">{apiError}</p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-[#101F33] text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-all hover:bg-[#1A2D47] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-[15px] text-stone-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-[#101F33] hover:text-[#E8A33D] transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="hidden sm:block text-center text-xs text-stone-400 pb-6">
                    © {new Date().getFullYear()} TicketDot. All journeys, one platform.
                </p>
            </div>
        </div>
    );
};

export default Login;
