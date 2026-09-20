import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Lock, User, Eye, EyeOff, ChevronDown, ArrowRight, Globe, MapPin, ShieldCheck, Users, Check } from 'lucide-react'
import { loginUser, clearError } from '../store/slices/authSlice'

const STRINGS = {
  en: {
    welcome: 'Welcome',
    welcomeSub: 'to Qassim Chamber',
    description:
      'Access the comprehensive employee management system. Connect with colleagues, manage schedules, and streamline communication across all departments of Qassim Chamber.',
    signIn: 'Sign in',
    signInSub: 'Enter your credentials to access your account',
    username: 'Username',
    usernamePlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    or: 'or',
    demoTitle: 'Demo Credentials',
    demoSub: 'Use the following account to test the system:',
    demoOthers: 'Other roles:',
    email: 'Email',
    needAccess: 'Need access? Contact your system administrator to create your account.',
    footerName: 'Qassim Chamber',
    tagline: 'Together for a stronger business community',
  },
  ar: {
    welcome: 'مرحباً',
    welcomeSub: 'بكم في غرفة القصيم',
    description:
      'الوصول إلى نظام إدارة الموظفين الشامل. تواصل مع زملائك، وأدِر الجداول، وسهّل التواصل بين جميع إدارات غرفة القصيم.',
    signIn: 'تسجيل الدخول',
    signInSub: 'أدخل بيانات الاعتماد للوصول إلى حسابك',
    username: 'اسم المستخدم',
    usernamePlaceholder: 'أدخل بريدك الإلكتروني',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    or: 'أو',
    demoTitle: 'بيانات تجريبية',
    demoSub: 'استخدم الحساب التالي لتجربة النظام:',
    demoOthers: 'أدوار أخرى:',
    email: 'البريد',
    needAccess: 'تحتاج إلى صلاحية وصول؟ تواصل مع مسؤول النظام لإنشاء حسابك.',
    footerName: 'غرفة القصيم',
    tagline: 'معاً من أجل مجتمع أعمال أقوى',
  },
}

const LANGUAGES = [
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'ar', short: 'AR', label: 'العربية' },
]

const demoAccounts = [
  { role: 'Admin', email: 'admin@company.com', password: 'Admin@123' },
  { role: 'HR', email: 'ahmed.rashid@company.com', password: 'Pass@123' },
  { role: 'Manager', email: 'mohammed.sheikh@company.com', password: 'Pass@123' },
  { role: 'Employee', email: 'emily.chen@company.com', password: 'Pass@123' },
]

const getInitialLang = () => {
  try {
    return localStorage.getItem('loginLang') === 'ar' ? 'ar' : 'en'
  } catch {
    return 'en'
  }
}

const Logo = ({ size = 'lg' }) => (
  <img
    src="/logo.webp"
    alt="Qassim Chamber"
    className={`w-auto self-start ${size === 'lg' ? 'h-20' : 'h-14'}`}
  />
)

// Night-time curved building facade with lit windows and palms
const BuildingScene = () => (
  <svg
    viewBox="0 0 1000 520"
    preserveAspectRatio="xMinYMax slice"
    className="h-full w-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="qc-window" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffcf8a" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#d9843a" stopOpacity="0.55" />
      </linearGradient>
      <pattern id="qc-windows" width="44" height="36" patternUnits="userSpaceOnUse" patternTransform="skewY(12)">
        <rect width="44" height="36" fill="#0d1a3a" />
        <rect x="3" y="4" width="38" height="28" fill="url(#qc-window)" />
        <rect x="21" y="4" width="2" height="28" fill="#0d1a3a" opacity="0.8" />
      </pattern>
      <linearGradient id="qc-facade-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a1640" stopOpacity="0" />
        <stop offset="100%" stopColor="#070f2e" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="qc-roof-glow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="60%" stopColor="#bcd4ff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#6e9cff" stopOpacity="0.2" />
      </linearGradient>
      <clipPath id="qc-facade-clip">
        <path d="M0 200 Q 470 300 900 520 L0 520 Z" />
      </clipPath>
      <filter id="qc-blur" x="-10%" y="-50%" width="120%" height="200%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <g id="qc-palm">
        <path d="M0 0 C 3 -60 -2 -120 4 -170" stroke="#050b22" strokeWidth="7" fill="none" />
        <g fill="#050b22">
          <path d="M4 -170 C -30 -185 -60 -175 -80 -150 C -55 -165 -30 -168 4 -164 Z" />
          <path d="M4 -170 C 38 -188 68 -178 88 -152 C 62 -168 36 -170 4 -164 Z" />
          <path d="M4 -170 C -18 -200 -44 -210 -66 -206 C -40 -198 -20 -186 2 -166 Z" />
          <path d="M4 -170 C 24 -204 48 -214 70 -210 C 46 -200 26 -188 6 -166 Z" />
          <path d="M4 -170 C 0 -196 6 -214 16 -224 C 12 -204 10 -188 8 -168 Z" />
          <path d="M4 -170 C -24 -168 -46 -150 -56 -124 C -38 -146 -18 -158 2 -164 Z" />
          <path d="M4 -170 C 30 -166 52 -146 60 -120 C 42 -142 24 -156 6 -164 Z" />
        </g>
      </g>
    </defs>

    {/* Roof slab */}
    <path d="M0 176 Q 480 272 930 520 L900 520 Q 470 300 0 200 Z" fill="#101f4d" />
    {/* Glowing roof edge */}
    <path d="M0 176 Q 480 272 930 520" stroke="url(#qc-roof-glow)" strokeWidth="10" fill="none" filter="url(#qc-blur)" />
    <path d="M0 176 Q 480 272 930 520" stroke="url(#qc-roof-glow)" strokeWidth="2.5" fill="none" />

    {/* Facade windows */}
    <g clipPath="url(#qc-facade-clip)">
      <rect width="1000" height="520" fill="url(#qc-windows)" />
      <rect width="1000" height="520" fill="url(#qc-facade-fade)" />
    </g>

    {/* Palms */}
    <use href="#qc-palm" transform="translate(70 520) scale(1.25)" />
    <use href="#qc-palm" transform="translate(190 520) scale(0.95)" />
    <use href="#qc-palm" transform="translate(300 520) scale(1.1)" />
    <use href="#qc-palm" transform="translate(420 520) scale(0.8)" />
  </svg>
)

const LoginPage = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth)
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [lang, setLang] = useState(getInitialLang)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  const t = STRINGS[lang]
  const isRtl = lang === 'ar'
  const [primaryDemo, ...otherDemos] = demoAccounts

  const fillCredentials = (email, password) => {
    setFormData({ email, password })
  }

  const changeLanguage = (code) => {
    setLang(code)
    setLangOpen(false)
    try {
      localStorage.setItem('loginLang', code)
    } catch {
      // storage unavailable; language just won't persist
    }
  }

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (!langOpen) return
    const close = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [langOpen])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Send email as username to backend (backend accepts username or email under 'username')
    dispatch(loginUser({ username: (formData.email || '').trim().toLowerCase(), password: formData.password }))
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const inputClass =
    'block w-full h-14 rounded-xl border border-white/20 bg-[#0a1a4a]/60 ps-12 text-base text-white placeholder-blue-200/40 ' +
    'transition-colors focus:border-blue-400 focus:bg-[#0a1a4a]/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40'

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={lang}
      className={`relative min-h-screen overflow-hidden bg-[#081640] text-white ${isRtl ? 'font-arabic' : ''}`}
    >
      {/* ---------- Background ---------- */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f5c] via-[#0a1a4e] to-[#081640]" />
        <div className="absolute -top-40 left-1/4 h-[36rem] w-[36rem] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-indigo-500/20 blur-[120px]" />
        {/* Chevron light planes */}
        <div className="absolute left-[45%] top-1/2 hidden h-[46rem] w-[46rem] -translate-y-1/2 rotate-45 bg-gradient-to-br from-white/[0.06] to-transparent lg:block" />
        <div className="absolute -top-24 left-[30%] hidden h-[30rem] w-[30rem] rotate-45 border border-white/[0.04] bg-white/[0.02] lg:block" />
        {/* Light streaks */}
        <div className="absolute -left-20 top-40 h-px w-[40rem] -rotate-[35deg] bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
        <div className="absolute -left-10 top-20 h-px w-[30rem] -rotate-[50deg] bg-gradient-to-r from-transparent via-blue-200/25 to-transparent" />
        {/* Building */}
        <div className="absolute bottom-0 left-0 hidden h-[58%] w-[58%] opacity-90 rtl:left-auto rtl:right-0 rtl:-scale-x-100 lg:block">
          <BuildingScene />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#081640] to-transparent lg:hidden" />
      </div>

      {/* ---------- Language switcher ---------- */}
      <div ref={langRef} className="absolute end-6 top-6 z-20 sm:end-10">
        <button
          type="button"
          onClick={() => setLangOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={langOpen}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
        >
          <Globe className="h-5 w-5" />
          {LANGUAGES.find((l) => l.code === lang).short}
          <ChevronDown className={`h-4 w-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
        </button>
        {langOpen && (
          <ul
            role="listbox"
            className="absolute end-0 mt-2 w-40 overflow-hidden rounded-xl border border-white/15 bg-[#0d1f55]/95 py-1 shadow-2xl backdrop-blur"
          >
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={lang === l.code}
                  onClick={() => changeLanguage(l.code)}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                >
                  {l.label}
                  {lang === l.code && <Check className="h-4 w-4 text-blue-300" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- Content ---------- */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-20 sm:px-8 lg:px-16">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: welcome */}
          <div className="hidden min-h-[40rem] flex-col lg:flex">
            <Logo size="lg" />

            <div className="mt-28 max-w-xl">
              <h1 className="text-6xl font-extrabold tracking-tight">{t.welcome}</h1>
              <p className="mt-3 text-5xl font-light text-blue-50/90">{t.welcomeSub}</p>
              <p className="mt-8 text-lg leading-relaxed text-blue-100/80">{t.description}</p>
            </div>

            <div className="mt-auto flex items-center gap-3 pt-16 text-sm">
              <MapPin className="h-5 w-5 text-blue-200" />
              <span className="font-medium text-white">{t.footerName}</span>
              <span className="h-4 w-px bg-white/30" />
              <span className="text-blue-100/80">{t.tagline}</span>
            </div>
          </div>

          {/* Right: sign-in card */}
          <div className="w-full">
            <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-[#0b1d52]/70 p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-12 lg:ms-auto lg:me-0">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" aria-hidden="true" />

              <Logo size="sm" />

              <h2 className="mt-8 text-3xl font-bold">{t.signIn}</h2>
              <p className="mt-2 text-base text-blue-100/75">{t.signInSub}</p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-blue-50">
                    {t.username}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
                      <User className="h-5 w-5 text-blue-200/70" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`${inputClass} pe-4`}
                      placeholder={t.usernamePlaceholder}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-blue-50">
                    {t.password}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
                      <Lock className="h-5 w-5 text-blue-200/70" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputClass} pe-12`}
                      placeholder={t.passwordPlaceholder}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                      className="absolute inset-y-0 end-0 flex items-center pe-4 text-blue-200/70 transition-colors hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="inline-flex cursor-pointer select-none items-center gap-3 text-base text-blue-50/90">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/40 bg-white/5 transition-colors peer-checked:border-blue-400 peer-checked:bg-blue-500/20 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400">
                      {rememberMe && <Check className="h-3.5 w-3.5 text-blue-200" />}
                    </span>
                    {t.remember}
                  </label>
                  <a href="#" className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300">
                    {t.forgot}
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3">
                    <div className="text-sm text-red-200">{error}</div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-lg font-semibold text-white shadow-lg shadow-blue-900/40 transition-all hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0b1d52] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      {t.signIn}
                      <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4 text-sm text-blue-100/60">
                <span className="h-px flex-1 bg-white/15" />
                {t.or}
                <span className="h-px flex-1 bg-white/15" />
              </div>

              {/* Demo Credentials */}
              <div className="rounded-2xl bg-[#13275f]/80 p-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 ring-4 ring-blue-500/20">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{t.demoTitle}</p>
                    <p className="mt-1 text-sm text-blue-100/75">{t.demoSub}</p>
                    <button
                      type="button"
                      onClick={() => fillCredentials(primaryDemo.email, primaryDemo.password)}
                      className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-md text-start text-sm transition-opacity hover:opacity-80"
                    >
                      <span>
                        <span className="text-blue-400">{t.email}:</span>{' '}
                        <span className="text-white">{primaryDemo.email}</span>
                      </span>
                      <span>
                        <span className="text-blue-400">{t.password}:</span>{' '}
                        <span className="text-white">{primaryDemo.password}</span>
                      </span>
                    </button>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-blue-100/60">{t.demoOthers}</span>
                      {otherDemos.map((acc) => (
                        <button
                          key={acc.role}
                          type="button"
                          title={acc.email}
                          onClick={() => fillCredentials(acc.email, acc.password)}
                          className="rounded-full border border-white/15 px-2.5 py-0.5 text-blue-100/90 transition-colors hover:border-blue-400/60 hover:bg-blue-500/15"
                        >
                          {acc.role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-6 flex items-start justify-center gap-2 text-center text-sm text-blue-100/70">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="max-w-xs">{t.needAccess}</span>
              </p>
            </div>

            {/* Mobile footer */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-blue-100/70 lg:hidden">
              <MapPin className="h-4 w-4" />
              <span className="font-medium text-white">{t.footerName}</span>
              <span className="text-white/30">|</span>
              <span>{t.tagline}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
