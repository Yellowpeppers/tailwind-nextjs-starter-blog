import Link from './Link'

export default function ADHDTestCard() {
  return (
    <div className="my-8 flex flex-col items-center justify-between gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-pink-500/10 md:flex-row">
      <div className="flex-1">
        <p className="text-xs font-semibold tracking-[0.4em] text-pink-500 uppercase">Pro Tip</p>
        <h3 className="mt-2 text-2xl font-bold text-gray-900">Curious about your focus levels?</h3>
        <p className="mt-3 text-sm text-gray-600">
          Run the same ASRS v1.1 screener clinicians use and get instant guidance on where to start.
        </p>
      </div>
      <div className="flex-shrink-0">
        <Link
          href="/test"
          className="inline-flex transform items-center rounded-full bg-pink-500 px-6 py-2 font-medium !text-white text-white transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
        >
          Start Free Assessment
        </Link>
      </div>
    </div>
  )
}
