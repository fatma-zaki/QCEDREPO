import { useState } from 'react'
import { MapPin } from 'lucide-react'

// Full-screen branded splash shown while the app boots or a lazy route loads
const AppLoadingScreen = ({ label = 'Loading...' }) => {
  const [bgLoaded, setBgLoaded] = useState(false)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-[100] overflow-hidden bg-[#0a1440] text-white"
    >
      {/* ---------- Background ---------- */}
      <img
        src="/background.webp"
        alt=""
        aria-hidden="true"
        onLoad={() => setBgLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover object-[70%_center] transition-opacity duration-700 lg:object-right ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Darken the left for text legibility, fade the base into the page colour */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1440]/95 via-[#0a1440]/75 via-40% to-[#0a1440]/20 lg:from-[#0a1440]/90 lg:via-[#0a1440]/40 lg:to-transparent lg:to-55%" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1440]/70 via-transparent to-[#0a1440]/80 lg:from-[#0a1440]/30 lg:to-[#0a1440]/30" />
      </div>

      {/* ---------- Header ---------- */}
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-8 sm:px-12 sm:pt-12 lg:px-20 lg:pt-16">
        <img src="/logo.webp" alt="Qassim Chamber" className="h-14 w-auto sm:h-16 lg:h-20" />
        <div className="hidden items-center gap-4 text-[11px] font-medium uppercase tracking-[0.3em] text-blue-100/80 md:flex">
          <span className="h-px w-16 bg-blue-400/80" />
          <span>Business</span>
          <span className="text-blue-300/60">/</span>
          <span>Growth</span>
          <span className="text-blue-300/60">/</span>
          <span>Community</span>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <main className="relative flex h-full items-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-3xl animate-[fadeIn_0.8s_ease-out] lg:ps-32">
          <p className="text-sm font-light uppercase tracking-[0.3em] text-blue-100/80 sm:text-lg">Welcome to</p>
          <h1 className="mt-3 text-5xl leading-tight sm:whitespace-nowrap sm:text-6xl lg:text-7xl">
            <span className="font-bold">Qassim</span>{' '}
            <span className="font-light text-blue-300">Chamber</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed tracking-wide text-blue-100/80 sm:text-xl">
            Connecting businesses. Building a stronger community across Qassim.
          </p>

          {/* Indeterminate progress bar */}
          <div className="mt-14 h-[3px] w-full max-w-[340px] overflow-hidden rounded-full bg-blue-300/15">
            <div className="h-full w-1/4 animate-loading-bar rounded-full bg-gradient-to-r from-indigo-400 via-blue-400 to-blue-300 shadow-[0_0_12px_rgba(129,140,248,0.9)]" />
          </div>
          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.3em] text-blue-100/70">{label}</p>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-5 gap-y-2 px-6 pb-8 text-sm sm:px-12 sm:pb-12 lg:px-24 lg:pb-16">
        <span className="flex items-center gap-3">
          <MapPin className="h-5 w-5 fill-blue-400 text-blue-400 [&>circle]:fill-[#0a1440]" />
          <span className="font-medium text-white">Qassim Chamber</span>
        </span>
        <span className="hidden h-5 w-px bg-blue-300/40 sm:block" />
        <span className="text-blue-100/80">Together for a stronger business community</span>
      </footer>
    </div>
  )
}

export default AppLoadingScreen
