import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">404</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">The page you are looking for is unavailable or has moved.</p>
        <Link to="/" className="mt-6 inline-flex">
          <Button>Back home</Button>
        </Link>
      </div>
    </div>
  )
}
