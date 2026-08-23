import { useDashboard } from '../../features/dashboard/useDashboard'
import { VisitTable } from './cards/VisitTable'
import {
  Users,
  UserCheck,
  UserMinus,
  AlertTriangle,
  RefreshCw,
  Clock,
  Moon,
} from 'lucide-react'

export default function Dashboard() {
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    checkOut,
    checkingOutVisitId,
  } = useDashboard()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error && !data) {
    return (
      <DashboardError
        message={error}
        onRetry={refresh}
      />
    )
  }

  const {
    summary,
    activeVisitors,
    overdueVisitors,
    overnightVisitors,
    recentlyCheckedOut,
  } = data!

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-neutral-900 tracking-tight">
            Dashboard
          </h1>

          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock size={11} />
              Updated {formatTime(lastUpdated)}

              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 ml-1 animate-[pulse_2s_ease-in-out_infinite]" />
            </p>
          )}
        </div>

        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh dashboard"
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <SummaryCard
          label="On Premises"
          value={summary.currentlyOnPremises}
          icon={<Users size={18} />}
          color="green"
        />

        <SummaryCard
          label="Checked In Today"
          value={summary.checkedInToday}
          icon={<UserCheck size={18} />}
          color="blue"
        />

        <SummaryCard
          label="Checked Out Today"
          value={summary.checkedOutToday}
          icon={<UserMinus size={18} />}
          color="gray"
        />

        <SummaryCard
          label="Overdue"
          value={summary.overdueCount}
          icon={<AlertTriangle size={18} />}
          color={summary.overdueCount > 0 ? 'amber' : 'gray'}
          highlight={summary.overdueCount > 0}
        />

        <SummaryCard
          label="Overnight"
          value={summary.overnightCount}
          icon={<Moon size={18} />}
          color={summary.overnightCount > 0 ? 'purple' : 'gray'}
          highlight={summary.overnightCount > 0}
        />
      </div>

      {/* Active + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <VisitTable
          title="Currently On Premises"
          visitors={activeVisitors}
          emptyMessage="No visitors currently on premises"
          checkOut={checkOut}
          checkingOutVisitId={checkingOutVisitId}
          showCheckout
        />

        <VisitTable
          title="Overdue Visitors"
          visitors={overdueVisitors}
          emptyMessage="No overdue visitors"
          checkOut={checkOut}
          checkingOutVisitId={checkingOutVisitId}
          showCheckout
          overdue
        />
      </div>

      {/* Overnight */}
      <div className="mb-6">
        <VisitTable
          title="Overnight Visitors"
          visitors={overnightVisitors}
          emptyMessage="No overnight visitors"
          checkOut={checkOut}
          checkingOutVisitId={checkingOutVisitId}
          showCheckout
          overnight
        />
      </div>

      {/* Recently checked out */}
      <VisitTable
        title="Recently Checked Out"
        visitors={recentlyCheckedOut}
        emptyMessage="No visitors checked out yet today"
        showCheckout={false}
      />
    </div>
  )
}

/* Summary card */

interface SummaryCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: 'green' | 'blue' | 'gray' | 'amber' | 'purple'
  highlight?: boolean
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

function SummaryCard({
  label,
  value,
  icon,
  color,
  highlight,
}: SummaryCardProps) {
  const c = COLOR_MAP[color]

  return (
    <div
      className={[
        'rounded-xl p-5 border transition-all duration-200',
        highlight && color === 'amber'
          ? 'border-amber-200 bg-amber-50 shadow-[0_0_0_3px_rgba(251,191,36,0.12)]'
          : highlight && color === 'purple'
            ? 'border-purple-200 bg-purple-50 shadow-[0_0_0_3px_rgba(168,85,247,0.12)]'
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
}

/* Skeleton */

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-40 bg-gray-100 rounded-lg mb-2" />
      <div className="h-3 w-32 bg-gray-100 rounded mb-8" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl h-28 border border-gray-100"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-xl h-64 border border-gray-100" />
        <div className="bg-gray-50 rounded-xl h-64 border border-gray-100" />
      </div>

      <div className="bg-gray-50 rounded-xl h-56 border border-gray-100 mb-6" />

      <div className="bg-gray-50 rounded-xl h-48 border border-gray-100" />
    </div>
  )
}

/* Error */

interface DashboardErrorProps {
  message: string
  onRetry: () => void
}

function DashboardError({
  message,
  onRetry,
}: DashboardErrorProps) {
  return (
    <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <span className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle size={20} className="text-red-400" />
      </span>

      <p className="text-sm font-semibold text-neutral-900 mb-1">
        Failed to load dashboard
      </p>

      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        {message}
      </p>

      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-500 transition-colors duration-150"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  )
}

/* Helpers */

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
