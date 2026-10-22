import React, { useState, useEffect } from 'react';
import { Lock, Bus, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword as resetPasswordApi } from '../api/auth';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync token state when URL search parameter changes
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (success && countdown === 0) {
      navigate('/login');
    }
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const validate = () => {
    if (!token.trim()) return 'Reset token is required';
    if (!newPassword) return 'Please enter a new password';
    if (newPassword.length < 6) return 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const valErr = validate();
    if (valErr) {
      setError(valErr);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await resetPasswordApi(token.trim(), newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to reset password. Token may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

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
            Set your new credentials.
          </h1>
          <p className="mt-4 text-[15px] text-white/60 max-w-sm leading-relaxed">
            Create a strong, memorable password to protect your bookings and profile information.
          </p>

          <div className="mt-10 flex items-center gap-3 text-white/50 text-sm">
            <ShieldCheck size={16} className="text-[#E8A33D]" />
            <span>Encrypted credentials salted with bcrypt</span>
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

            {!success ? (
              <>
                <div className="mb-8">
                  <h2 className="text-[1.65rem] font-semibold tracking-tight text-stone-900">
                    Reset your password
                  </h2>
                  <p className="mt-1.5 text-[15px] text-stone-500">
                    Enter your verification token and your new password below.
                  </p>
                </div>

                <form onSubmit={handleReset} noValidate className="space-y-4">
                  {/* Token Field */}
                  <div>
                    <label
                      htmlFor="token"
                      className="block text-sm font-medium text-stone-700 mb-1.5"
                    >
                      Reset Token
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        id="token"
                        type="text"
                        placeholder="Paste 64-char reset token"
                        value={token}
                        onChange={(e) => {
                          setToken(e.target.value);
                          if (error) setError('');
                        }}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 bg-white font-mono text-xs font-semibold text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5 transition-colors"
                      />
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-stone-700 mb-1.5"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError('');
                        }}
                        className="w-full h-12 pl-10 pr-11 rounded-xl border border-stone-200 bg-white text-[15px] text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden flex gap-1">
                          <div
                            className={`h-full flex-1 rounded-full transition-colors ${
                              strength >= 1 ? (strength === 1 ? 'bg-rose-500' : strength === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-colors ${
                              strength >= 2 ? (strength === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-colors ${
                              strength >= 3 ? 'bg-emerald-500' : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-colors ${
                              strength >= 4 ? 'bg-emerald-600' : 'bg-transparent'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-stone-500 block">
                          Strength:{' '}
                          {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-stone-700 mb-1.5"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        id="confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError('');
                        }}
                        className="w-full h-12 pl-10 pr-11 rounded-xl border border-stone-200 bg-white text-[15px] text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 mt-2 rounded-xl bg-[#101F33] text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-all hover:bg-[#1A2D47] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm text-center animate-in fade-in duration-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100">
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="text-xl font-bold text-stone-900">
                  Password Reset Successfully!
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Your credentials have been securely updated. You can now log into your TicketDot account with your new password.
                </p>

                <div className="pt-2">
                  <p className="text-xs text-stone-400 font-medium mb-4">
                    Redirecting to sign in within <span className="font-bold text-stone-800">{countdown}</span> seconds...
                  </p>

                  <Link
                    to="/login"
                    className="w-full h-11 rounded-xl bg-[#101F33] hover:bg-[#1A2D47] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Sign In Now</span>
                    <ArrowRight size={14} />
                  </Link>
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

export default ResetPassword;
