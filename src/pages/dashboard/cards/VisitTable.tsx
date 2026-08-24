import { Users } from 'lucide-react'
import type { VisitResponse } from '../../../features/dashboard/dashboardApi'
import { VisitRow } from './VisitRow'

interface VisitTableProps {
  title: string
  visitors: VisitResponse[]
  emptyMessage: string
  showCheckout: boolean
  checkOut?: (visitId: string) => Promise<void>
  checkingOutVisitId?: string | null
  overdue?: boolean
  overnight?: boolean
}

export function VisitTable({
  title,
  visitors,
  emptyMessage,
  showCheckout,
  checkOut,
  checkingOutVisitId,
  overdue = false,
  overnight = false,
}: VisitTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="font-display font-bold text-sm text-neutral-900 tracking-tight">
          {title}
        </h2>

        <span
          className={[
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            overdue && visitors.length > 0
              ? 'bg-amber-100 text-amber-700'
              : overnight && visitors.length > 0
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-500',
          ].join(' ')}
        >
          {visitors.length}
        </span>
      </div>

      {/* Empty state */}
      {visitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-5">
          <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Users size={18} className="text-gray-300" />
          </span>

          <p className="text-sm text-gray-400">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-50">
          {visitors.map((visit) => (
            <VisitRow
              key={visit.id}
              visit={visit}
              showCheckout={showCheckout}
              onCheckOut={checkOut}
              isCheckingOut={checkingOutVisitId === visit.id}
              overdue={overdue}
              overnight={overnight}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
