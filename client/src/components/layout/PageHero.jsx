import { CalendarDays } from 'lucide-react'
import TopBar, { useNow } from './TopBar'

export const HeroDate = () => {
  const now = useNow()
  return (
    <p className="flex items-center gap-2 text-[13px] text-navy-800/80">
      <CalendarDays className="h-4 w-4" strokeWidth={1.7} />
      {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      <span aria-hidden="true">·</span>
      {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
    </p>
  )
}

/**
 * Page banner: top bar, eyebrow, serif title, description, meta row and an optional
 * italic tagline, over the Qassim Chamber building photo.
 */
const PageHero = ({ eyebrow, title, description, meta = <HeroDate />, tagline, actions }) => (
  <header className="relative isolate overflow-hidden bg-gradient-to-r from-[#eef1fb] via-[#eceffa] to-[#e8ebf8]">
    <img
      src="/qassim_chamber_building_background.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[116%] w-auto max-w-none select-none"
    />
    {/* Fade the photo into the sky on the left so the heading stays legible */}
    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#eef1fb] via-[#eef1fb]/80 to-transparent md:via-[#eef1fb]/40" />
    <div className="pointer-events-none absolute inset-0 -z-10 bg-white/40 md:hidden" />

    <div className="px-4 pt-5 sm:px-6 xl:px-10">
      <TopBar />
    </div>

    <div className="flex flex-col gap-5 px-4 pb-10 pt-8 sm:px-6 md:flex-row md:items-end md:justify-between lg:pb-12 lg:pt-10 xl:px-14">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-navy-500">{eyebrow}</p>}
        <h1 className="font-serif text-[2rem] leading-[1.15] text-navy-800 sm:text-[2.35rem]">{title}</h1>
        {description && <p className="mt-3 max-w-lg text-sm leading-relaxed text-navy-800/75">{description}</p>}
        {meta && <div className="mt-4">{meta}</div>}
      </div>

      {(tagline || actions) && (
        <div className="flex flex-col items-start gap-4 md:items-end md:self-stretch md:justify-between">
          {tagline && (
            <div className="hidden rounded-xl bg-white/40 px-4 py-3 backdrop-blur-[2px] lg:block">
              <p className="max-w-[11rem] font-serif text-[15px] italic leading-snug text-navy-800/85">{tagline}</p>
              <span className="mt-3 block h-px w-8 bg-navy-800/40" />
            </div>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
    </div>
  </header>
)

export default PageHero
