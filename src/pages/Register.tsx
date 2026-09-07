import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EEF4FB] via-[#F4F7FC] to-[#E9EFF7] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white/40 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-blue-100/60 shadow-xl shadow-blue-900/5">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand & Features */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 grid grid-cols-2 gap-1 p-1 bg-blue-600 rounded-lg shadow-sm">
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-blue-300 rounded-sm"></div>
                  <div className="bg-blue-200 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                </div>
                <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">RefineBoard</h1>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-4 tracking-wide">
                Plan Better. Refine Smarter. Build Together.
              </p>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1E293B] leading-snug mb-6">
                Join your team to refine requirements, estimate effort, and ship quality software.
              </h2>

              {/* Feature Highlights */}
              <div className="space-y-3.5 my-6 max-w-lg">
                <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Definition of Ready Gate</p>
                    <p className="text-xs text-slate-500 mt-0.5">Automated quality scoring ensures stories are complete before development</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Decoupled Workflow Model</p>
                    <p className="text-xs text-slate-500 mt-0.5">Separates refinement planning stages from engineering development status</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Supabase PostgreSQL Persistence</p>
                    <p className="text-xs text-slate-500 mt-0.5">Real cloud database backing your backlog, sprints, criteria, and history</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote at bottom left */}
            <div className="mt-4 pt-4 border-t border-blue-100/60">
              <p className="text-xs sm:text-sm font-medium text-slate-700 italic flex items-center gap-1">
                <span className="text-blue-600 font-serif text-base sm:text-lg font-bold">“</span>
                Good requirements build great products.
                <span className="text-blue-600 font-serif text-lg font-bold">”</span>
              </p>
              <div className="w-8 h-1 bg-blue-600 rounded-full mt-1.5"></div>
            </div>
          </div>

          {/* Right Column: Register Card */}
          <div className="md:col-span-6 lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 lg:p-9 border border-slate-100">
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-1.5">Create Account</h2>
                <p className="text-xs sm:text-sm text-slate-500">Get started with RefineBoard today</p>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
                  <span className="font-bold">✕</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>

              {/* Footer Log In Link */}
              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                    Log In
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
