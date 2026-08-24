import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock,
  RefreshCw,
  UserCheck,
  Users,
} from 'lucide-react'

import { useDashboard } from '../../features/dashboard/useDashboard'
import { useSites } from '../../features/admin/useSites'
import { useAuth } from '../../auth/AuthContext'
import { ROUTE_PATHS } from '../../router/constants'
import { SiteVisitCard } from '../dashboard/cards/SiteVisitCard'

export default function AdminPage() {
  useAuth()

  const {
    data,
    isLoading: dashboardLoading,
    isRefreshing,
    lastUpdated,
    refresh,
    checkOut,
    checkingOutVisitId,
  } = useDashboard()

  const {
    sites,
    isLoading: sitesLoading,
  } = useSites()

  useEffect(() => {
    document.title = 'Admin Overview — Gatelog'
  }, [])

  const isLoading = dashboardLoading || sitesLoading

  /*
   * Group all current visits by site.
   *
   * A visit can appear in active, overdue, and overnight at the
   * same time, so we first build one unique collection by visit ID.
   */
  const {
    visitsBySite,
    overdueIds,
    overnightIds,
  } = useMemo(() => {
    const overdue = new Set<string>()
    const overnight = new Set<string>()

    if (!data) {
      return {
        visitsBySite: new Map<string, typeof data extends null ? never : never>(),
        overdueIds: overdue,
        overnightIds: overnight,
      }
    }

    for (const visit of data.overdueVisitors) {
      overdue.add(visit.id)
    }

    for (const visit of data.overnightVisitors) {
      overnight.add(visit.id)
    }

    const uniqueVisits = new Map<
      string,
      (typeof data.activeVisitors)[number]
    >()

    for (const visit of data.activeVisitors) {
      uniqueVisits.set(visit.id, visit)
    }

    for (const visit of data.overdueVisitors) {
      uniqueVisits.set(visit.id, visit)
    }

    for (const visit of data.overnightVisitors) {
      uniqueVisits.set(visit.id, visit)
    }

    const grouped = new Map<
      string,
      (typeof data.activeVisitors)
    >()

    for (const visit of uniqueVisits.values()) {
      const existing = grouped.get(visit.siteId) ?? []
      existing.push(visit)
      grouped.set(visit.siteId, existing)
    }

    return {
      visitsBySite: grouped,
      overdueIds: overdue,
      overnightIds: overnight,
    }
  }, [data])

  const totalOvernight = data?.summary.overnightCount ?? 0

  if (isLoading) {
    return <AdminSkeleton />
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle size={20} className="text-red-400" />
        </span>

        <p className="text-sm font-semibold text-neutral-900 mb-1">
          Failed to load admin dashboard
        </p>

        <p className="text-sm text-gray-400 mb-6 max-w-xs">
          Unable to load dashboard data. Please try again.
        </p>

        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-500 transition-colors duration-150"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">
            Admin
          </p>

          <h1 className="font-display text-2xl font-extrabold text-neutral-900 tracking-tight">
            System Overview
          </h1>

          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={11} />
              Updated {formatTime(lastUpdated)}

              <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1 animate-[pulse_2s_ease-in-out_infinite]" />
            </p>
          )}
        </div>

        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Active Sites"
          value={sites.length}
          icon={<Building2 size={18} />}
          color="green"
          linkTo={ROUTE_PATHS.SITES}
        />

        <StatCard
          label="On Premises"
          value={data.summary.currentlyOnPremises}
          icon={<UserCheck size={18} />}
          color="blue"
        />

        <StatCard
          label="Checked In Today"
          value={data.summary.checkedInToday}
          icon={<Users size={18} />}
          color="gray"
        />

        <StatCard
          label="Overdue"
          value={data.summary.overdueCount}
          icon={<AlertTriangle size={18} />}
          color={data.summary.overdueCount > 0 ? 'amber' : 'gray'}
          highlight={data.summary.overdueCount > 0}
        />

        <StatCard
          label="Overnight"
          value={totalOvernight}
          icon={<Clock size={18} />}
          color={totalOvernight > 0 ? 'purple' : 'gray'}
          highlight={totalOvernight > 0}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <QuickActionCard
          title="Site Management"
          desc="Create and manage sites across the platform."
          icon={<Building2 size={20} className="text-green-600" />}
          linkTo={ROUTE_PATHS.SITES}
          linkLabel="Manage Sites"
          count={sites.length}
          countLabel="sites"
        />

        <QuickActionCard
          title="User Management"
          desc="Create, update, and deactivate user accounts."
          icon={<Users size={20} className="text-green-600" />}
          linkTo={ROUTE_PATHS.USERS}
          linkLabel="Manage Users"
        />
      </div>

      {/* Sites */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-base text-neutral-900">
            Site Activity
          </h2>

          <p className="text-xs text-gray-400 mt-0.5">
            Current visitor activity across all sites
          </p>
        </div>

        <span className="text-xs font-semibold text-gray-400">
          {sites.length} sites
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sites
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((site) => (
            <SiteVisitCard
              key={site.id}
              site={site}
              visits={visitsBySite.get(site.id) ?? []}
              overdueIds={overdueIds}
              overnightIds={overnightIds}
              checkOut={checkOut}
              checkingOutVisitId={checkingOutVisitId}
            />
          ))}
      </div>

      {sites.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 py-12 text-center">
          <Building2
            size={24}
            className="mx-auto text-gray-300 mb-3"
          />

          <p className="text-sm font-semibold text-gray-700">
            No sites configured
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Create a site to start monitoring visitor activity.
          </p>
        </div>
      )}
    </div>
  )
}

const COLOR_MAP = {
  green: {
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-700',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
  },
  gray: {
    icon: 'bg-gray-100 text-gray-500',
    value: 'text-gray-700',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
  },
  purple: {
    icon: 'bg-purple-100 text-purple-600',
    value: 'text-purple-700',
  },
} as const

function StatCard({
  label,
  value,
  icon,
  color,
  highlight,
  linkTo,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: keyof typeof COLOR_MAP
  highlight?: boolean
  linkTo?: string
}) {
  const c = COLOR_MAP[color]

  const content = (
    <div
      className={[
        'rounded-xl p-5 border transition-all duration-200 h-full',
        highlight
          ? 'border-amber-200 bg-amber-50 shadow-[0_0_0_3px_rgba(251,191,36,0.12)]'
          : 'border-gray-100 bg-white',
      ].join(' ')}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </p>

        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}
        >
          {icon}
        </span>
      </div>

      <p
        className={`font-display text-3xl font-extrabold tracking-tight ${c.value}`}
      >
        {value}
      </p>
    </div>
  )

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="block hover:-translate-y-0.5 transition-transform duration-150"
      >
        {content}
      </Link>
    )
  }

  return content
}

function QuickActionCard({
  title,
  desc,
  icon,
  linkTo,
  linkLabel,
  count,
  countLabel,
}: {
  title: string
  desc: string
  icon: React.ReactNode
  linkTo: string
  linkLabel: string
  count?: number
  countLabel?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-sm text-neutral-900">
              {title}
            </h3>

            {count !== undefined && (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {count} {countLabel}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            {desc}
          </p>

          <Link
            to={linkTo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-500 transition-colors duration-150"
          >
            {linkLabel}
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function AdminSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-4 w-16 bg-gray-100 rounded mb-2" />
      <div className="h-8 w-48 bg-gray-100 rounded-lg mb-2" />
      <div className="h-3 w-32 bg-gray-100 rounded mb-8" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl h-28 border border-gray-100"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl h-32 border border-gray-100" />
        <div className="bg-gray-50 rounded-xl h-32 border border-gray-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl h-56 border border-gray-100"
          />
        ))}
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
