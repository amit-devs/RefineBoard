import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function AgileIllustration() {
  return (
    <div className="w-full relative select-none">
      <svg
        viewBox="0 0 520 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        {/* Subtle background glow */}
        <ellipse cx="230" cy="180" rx="200" ry="110" fill="#EBF2FA" opacity="0.7" />

        {/* Whiteboard Stand & Board */}
        <g id="whiteboard">
          {/* Board outer shadow & frame */}
          <rect x="50" y="30" width="320" height="190" rx="16" fill="#FFFFFF" stroke="#D1DFEE" strokeWidth="2.5" />
          
          {/* Header row */}
          <line x1="50" y1="65" x2="370" y2="65" stroke="#EDF2F7" strokeWidth="1.5" />
          <text x="88" y="52" fill="#64748B" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5">TO DO</text>
          <text x="165" y="52" fill="#64748B" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5">IN REVIEW</text>
          <text x="245" y="52" fill="#64748B" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5">REFINED</text>
          <text x="325" y="52" fill="#64748B" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5">READY</text>

          {/* Column 1 (To Do - Blue cards) */}
          <rect x="62" y="76" width="54" height="28" rx="6" fill="#E3EFFF" stroke="#C5DCFB" strokeWidth="1" />
          <rect x="68" y="84" width="34" height="4" rx="2" fill="#3B82F6" />
          <rect x="68" y="91" width="22" height="3" rx="1.5" fill="#93C5FD" />

          {/* Column 2 (In Review - Amber & Orange cards) */}
          <rect x="138" y="76" width="54" height="32" rx="6" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
          <rect x="144" y="84" width="36" height="4" rx="2" fill="#F59E0B" />
          <rect x="144" y="92" width="26" height="3" rx="1.5" fill="#FBBF24" />

          <rect x="138" y="114" width="54" height="30" rx="6" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="1" />
          <rect x="144" y="122" width="38" height="4" rx="2" fill="#F97316" />
          <rect x="144" y="129" width="20" height="3" rx="1.5" fill="#FDBA74" />

          {/* Column 3 (Refined - Emerald cards) */}
          <rect x="218" y="76" width="54" height="32" rx="6" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
          <rect x="224" y="84" width="36" height="4" rx="2" fill="#10B981" />
          <rect x="224" y="92" width="24" height="3" rx="1.5" fill="#6EE7B7" />

          <rect x="218" y="114" width="54" height="28" rx="6" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
          <rect x="224" y="122" width="30" height="4" rx="2" fill="#34D399" />

          {/* Column 4 (Ready - Purple cards) */}
          <rect x="298" y="76" width="54" height="32" rx="6" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="1" />
          <rect x="304" y="84" width="38" height="4" rx="2" fill="#8B5CF6" />
          <rect x="304" y="92" width="24" height="3" rx="1.5" fill="#C4B5FD" />
        </g>

        {/* Floating Agile Keyword tags with Arrow (outside the board on the right) */}
        <g id="floating-tags" transform="translate(390, 85)">
          <text x="35" y="16" fill="#3B82F6" fontSize="13" fontStyle="italic" fontWeight="600" textAnchor="end">Ideas</text>
          <text x="35" y="38" fill="#3B82F6" fontSize="13" fontStyle="italic" fontWeight="600" textAnchor="end">Stories</text>
          <text x="35" y="60" fill="#3B82F6" fontSize="13" fontStyle="italic" fontWeight="600" textAnchor="end">Teams</text>
          <text x="35" y="82" fill="#3B82F6" fontSize="13" fontStyle="italic" fontWeight="600" textAnchor="end">Results</text>
          
          {/* Trend arrow */}
          <path d="M42 85 L60 62 M60 62 L48 63 M60 62 L59 74" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Meeting Desk */}
        <rect x="70" y="240" width="310" height="12" rx="4" fill="#2563EB" opacity="0.85" />
        <rect x="90" y="252" width="10" height="50" fill="#1E40AF" opacity="0.4" />
        <rect x="350" y="252" width="10" height="50" fill="#1E40AF" opacity="0.4" />

        {/* Potted Plant on desk right */}
        <g id="plant" transform="translate(355, 195)">
          <path d="M12 45 L8 28 L24 28 L20 45 Z" fill="#475569" />
          <path d="M16 28 Q8 10 2 20 Q12 18 16 28 Z" fill="#10B981" />
          <path d="M16 28 Q16 2 22 14 Q20 18 16 28 Z" fill="#059669" />
          <path d="M16 28 Q24 8 30 18 Q22 20 16 28 Z" fill="#34D399" />
        </g>

        {/* Laptop on desk */}
        <g id="laptop" transform="translate(170, 218)">
          <path d="M6 22 L34 22 L38 24 L2 24 Z" fill="#94A3B8" />
          <rect x="8" y="4" width="24" height="18" rx="2" fill="#1E293B" />
          <rect x="10" y="6" width="20" height="14" fill="#3B82F6" opacity="0.4" />
        </g>

        {/* Person 1 (Facilitator pointing at whiteboard on left) */}
        <g id="person-left">
          {/* Head & Hair */}
          <circle cx="58" cy="148" r="14" fill="#FBBF24" />
          <path d="M46 146 Q54 133 68 138 Q66 148 54 150 Z" fill="#1E293B" />
          {/* Body / Blue Shirt */}
          <path d="M42 165 C42 165 48 162 58 162 C68 162 76 166 76 166 L78 220 C78 220 68 224 58 224 C48 224 40 220 40 220 Z" fill="#2563EB" />
          {/* Right Arm pointing to board */}
          <path d="M72 170 Q92 165 106 142" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" />
          <circle cx="106" cy="142" r="4.5" fill="#FBBF24" />
          {/* Left Arm holding clipboard */}
          <path d="M44 175 Q38 195 50 205" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" />
          <rect x="46" y="195" width="16" height="22" rx="3" fill="#1E293B" />
          {/* Legs */}
          <path d="M44 220 L40 290" stroke="#1E293B" strokeWidth="9" strokeLinecap="round" />
          <path d="M70 220 L74 290" stroke="#1E293B" strokeWidth="9" strokeLinecap="round" />
        </g>

        {/* Person 2 (Developer seated with laptop - center) */}
        <g id="person-center">
          {/* Head & Long Hair */}
          <path d="M120 180 Q130 162 142 180 Q145 208 120 208 Z" fill="#1E293B" />
          <circle cx="132" cy="180" r="11" fill="#FDE68A" />
          {/* Purple Shirt */}
          <path d="M118 198 C118 198 126 195 134 195 C142 195 150 198 150 198 L152 245 C146 248 122 248 116 245 Z" fill="#8B5CF6" />
          {/* Arms typing */}
          <path d="M120 206 Q135 224 165 226" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
          <path d="M148 206 Q156 220 172 226" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
          {/* Chair */}
          <path d="M106 215 Q112 250 114 285" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <path d="M110 248 L142 248" stroke="#334155" strokeWidth="4" />
        </g>

        {/* Person 3 (Team member seated on right - green shirt) */}
        <g id="person-right">
          {/* Head & Hair */}
          <circle cx="282" cy="186" r="11" fill="#FBBF24" />
          <path d="M272 182 Q280 172 292 176 Q290 186 280 188 Z" fill="#92400E" />
          {/* Green Shirt */}
          <path d="M270 202 C270 202 278 198 286 198 C294 198 302 202 302 202 L304 250 C298 252 274 252 268 250 Z" fill="#059669" />
          {/* Arms resting on desk */}
          <path d="M272 210 Q262 230 250 236" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
          {/* Chair */}
          <path d="M306 218 Q312 255 316 288" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFillDemo() {
    setEmail('demo@refineboard.com');
    setPassword('Password123!');
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EEF4FB] via-[#F4F7FC] to-[#E9EFF7] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white/40 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-blue-100/60 shadow-xl shadow-blue-900/5">
        
        {/* Main Grid: 2 columns on tablets & desktops, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand & Agile Illustration */}
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
                Groom user stories, align your team, and turn ideas into impact.
              </h2>

              {/* Vector Illustration */}
              <div className="my-2 max-w-lg">
                <AgileIllustration />
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

          {/* Right Column: Floating Login Card */}
          <div className="md:col-span-6 lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 lg:p-9 border border-slate-100">
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-1.5">Welcome Back</h2>
                <p className="text-xs sm:text-sm text-slate-500">Log in to continue to RefineBoard</p>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
                  <span className="font-bold">✕</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

                {/* Remember Me & Demo fill */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Fill Demo Credentials
                  </button>
                </div>

                {/* Log In Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <span>Log In</span>
                  )}
                </button>
              </form>

              {/* Footer Sign Up Link */}
              <div className="text-center mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                    Sign Up
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
