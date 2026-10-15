import React, { useState } from 'react';
import { Mail, Bus, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Copy, Check, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword as forgotPasswordApi } from '../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await forgotPasswordApi(email.trim());
      setSuccessData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    if (successData?.reset_token) {
      navigator.clipboard.writeText(successData.reset_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-stone-50">
      {/* Brand panel */}
      <div className="hidden md:flex md:w-[44%] lg:w-[40%] relative bg-[#101F33] text-white flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 px-10 pt-12">
          <Link to="/login" className="flex items-center gap-2.5 w-fit">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E8A33D]">
              <Bus size={20} className="text-[#101F33]" strokeWidth={2.25} />
            </div>
            <span className="text-xl font-semibold tracking-tight">TicketDot</span>
          </Link>
        </div>

        <div className="relative z-10 px-10 py-12">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-[#E8A33D]">
            <KeyRound size={24} />
          </div>
          <h1 className="text-[2.1rem] leading-[1.15] font-semibold tracking-tight max-w-sm">
            Account recovery made simple and secure.
          </h1>
          <p className="mt-4 text-[15px] text-white/60 max-w-sm leading-relaxed">
            Forgot your password? No problem. Enter your email and we'll generate instant reset credentials so you can get right back on the road.
          </p>

          <div className="mt-10 flex items-center gap-3 text-white/50 text-sm">
            <ShieldCheck size={16} className="text-[#E8A33D]" />
            <span>Time-limited one-time authentication tokens</span>
          </div>
        </div>

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
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2.5 px-6 pt-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#101F33]">
            <Bus size={18} className="text-[#E8A33D]" strokeWidth={2.25} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#101F33]">
            TicketDot
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 sm:py-16">
          <div className="w-full max-w-[420px]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to sign in</span>
            </Link>

            {!successData ? (
              <>
                <div className="mb-8">
                  <h2 className="text-[1.65rem] font-semibold tracking-tight text-stone-900">
                    Forgot password?
                  </h2>
                  <p className="mt-1.5 text-[15px] text-stone-500">
                    Enter the email associated with your TicketDot account and we'll help you reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                          if (error) setError('');
                        }}
                        className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-white text-[15px] text-stone-900 placeholder:text-stone-400 outline-none transition-colors ${
                          error
                            ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                            : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                        }`}
                      />
                    </div>
                    {error && (
                      <p className="mt-1.5 text-sm text-red-500">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-[#101F33] text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-all hover:bg-[#1A2D47] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Instructions</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-stone-400">
                      Remember your password?{' '}
                      <Link to="/login" className="font-semibold text-[#101F33] hover:text-[#E8A33D] transition-colors">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm animate-in fade-in duration-200 space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Reset Token Generated
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {successData.message}
                  </p>
                </div>

                {successData.reset_token && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      <span>One-Time Reset Token</span>
                      <button
                        type="button"
                        onClick={copyToken}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs font-bold text-stone-800 break-all select-all">
                      {successData.reset_token}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Valid for 1 hour. Keep this token private.
                    </p>
                  </div>
                )}

                <div className="space-y-2.5 pt-2">
                  {successData.reset_token ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/reset-password?token=${successData.reset_token}`)}
                      className="w-full h-11 rounded-xl bg-[#101F33] hover:bg-[#1A2D47] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <span>Proceed to Set New Password</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full h-11 rounded-xl bg-[#101F33] hover:bg-[#1A2D47] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      Return to Sign In
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSuccessData(null);
                      setEmail('');
                    }}
                    className="w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Try Another Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="hidden sm:block text-center text-xs text-stone-400 pb-6">
          © {new Date().getFullYear()} TicketDot. All journeys, one platform.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
