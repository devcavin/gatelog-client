import {
  Clock,
  Loader2,
  LogOut,
} from 'lucide-react'
import type { VisitResponse } from '../../../features/dashboard/dashboardApi'

interface VisitRowProps {
  visit: VisitResponse
  showCheckout: boolean
  onCheckOut?: (visitId: string) => Promise<void>
  isCheckingOut?: boolean
  overdue?: boolean
  overnight?: boolean
}

export function VisitRow({
  visit,
  showCheckout,
  onCheckOut,
  isCheckingOut = false,
  overdue = false,
  overnight = false,
}: VisitRowProps) {
  const initials = visit.profile.name
    .split(' ')
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <li className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-100">
      <div
        className={[
          'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold',
          overdue
            ? 'bg-amber-100 text-amber-700'
            : overnight
              ? 'bg-purple-100 text-purple-700'
              : 'bg-green-100 text-green-700',
        ].join(' ')}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate">
          {visit.profile.name}
        </p>

        <p className="text-xs text-gray-400 truncate">
          {visit.zoneName ? `${visit.zoneName} · ` : ''}
          {visit.visitorType} ·{' '}
          {formatTime(new Date(visit.checkInTime))}
        </p>
      </div>

      {overdue && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
          Overdue
        </span>
      )}

      {!overdue && overnight && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex-shrink-0">
          Overnight
        </span>
      )}

      {showCheckout && onCheckOut && (
        <button
          onClick={() => onCheckOut(visit.id)}
          disabled={isCheckingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label={`Check out ${visit.profile.name}`}
        >
          {isCheckingOut ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <LogOut size={12} />
          )}

          {isCheckingOut ? 'Checking out…' : 'Check out'}
        </button>
      )}

      {!showCheckout && visit.checkOutTime && (
        <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
          <Clock size={11} />
          {formatTime(new Date(visit.checkOutTime))}
        </span>
      )}
    </li>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
