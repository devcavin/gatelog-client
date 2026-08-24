import {
  AlertTriangle,
  Clock,
  Users,
} from 'lucide-react'
import type { VisitResponse } from '../../../features/dashboard/dashboardApi'
import type { Site } from '../../../features/admin/adminApi'
import { VisitRow } from './VisitRow'

interface SiteVisitCardProps {
  site: Site
  visits: VisitResponse[]
  overdueIds: Set<string>
  overnightIds: Set<string>
  checkOut: (visitId: string) => Promise<void>
  checkingOutVisitId: string | null
}

export function SiteVisitCard({
  site,
  visits,
  overdueIds,
  overnightIds,
  checkOut,
  checkingOutVisitId,
}: SiteVisitCardProps) {
  const overdueVisits = visits.filter((visit) =>
    overdueIds.has(visit.id),
  )

  const overnightVisits = visits.filter((visit) =>
    overnightIds.has(visit.id),
  )

  const attentionIds = new Set([
    ...overdueVisits.map((visit) => visit.id),
    ...overnightVisits.map((visit) => visit.id),
  ])

  const normalVisits = visits.filter(
    (visit) => !attentionIds.has(visit.id),
  )

  const orderedVisits = [
    ...overdueVisits,
    ...overnightVisits.filter(
      (visit) => !overdueIds.has(visit.id),
    ),
    ...normalVisits,
  ]

  return (
    <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Site header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-sm text-neutral-900 tracking-tight truncate">
              {site.name}
            </h2>

            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {site.location}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              <Users size={11} />
              {visits.length}
            </span>

            {overdueVisits.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle size={11} />
                {overdueVisits.length}
              </span>
            )}

            {overnightVisits.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                <Clock size={11} />
                {overnightVisits.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {orderedVisits.length === 0 ? (
        <div className="flex items-center justify-center py-8 px-5">
          <p className="text-sm text-gray-400">
            No visitors currently on premises
          </p>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-50">
          {orderedVisits.map((visit) => (
            <VisitRow
              key={visit.id}
              visit={visit}
              showCheckout
              onCheckOut={checkOut}
              isCheckingOut={checkingOutVisitId === visit.id}
              overdue={overdueIds.has(visit.id)}
              overnight={overnightIds.has(visit.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
