import StarBurst from './StarBurst'

const QuoteCard = ({ quote = 'Building a thriving business community', author = 'Qassim Chamber' }) => (
  <section className="relative overflow-hidden rounded-2xl border border-navy-100 bg-gradient-to-br from-white to-navy-50 px-6 py-6">
    <StarBurst className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 text-indigo-300/60" />
    <div className="relative">
      <span aria-hidden="true" className="font-serif text-4xl leading-none text-indigo-600">
        &ldquo;
      </span>
      <p className="mt-1 max-w-[12rem] font-serif text-lg leading-snug text-navy-800">{quote}</p>
      <div className="my-4 h-px w-8 bg-indigo-300" />
      <p className="text-[11px] font-medium text-navy-500">{author}</p>
    </div>
  </section>
)

export default QuoteCard
