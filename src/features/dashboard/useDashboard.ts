import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  dashboardApi,
  type DashboardFeed,
} from './dashboardApi'

const POLL_INTERVAL_MS = 30_000

interface UseDashboardReturn {
  data: DashboardFeed | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
  checkOut: (visitId: string) => Promise<void>
  checkingOutVisitId: string | null
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardFeed | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [checkingOutVisitId, setCheckingOutVisitId] =
    useState<string | null>(null)

  const dataRef = useRef<DashboardFeed | null>(null)

  /*
   * Keep the latest dashboard data available to callbacks
   * without making those callbacks depend on `data`.
   */
  useEffect(() => {
    dataRef.current = data
  }, [data])

  /*
   * Fetch dashboard data.
   *
   * This callback does not depend on component state, so its
   * identity remains stable.
   */
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) {
      if (dataRef.current) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
    }

    try {
      const response = await dashboardApi.getFeed()

      setData(response.data)
      setLastUpdated(new Date())
      setError(null)
    } catch {
      /*
       * Silent refreshes should preserve stale dashboard data.
       */
      if (!silent) {
        setError(
          'Failed to load dashboard. Check your connection.',
        )
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [])

  /*
   * Initial dashboard load.
   *
   * queueMicrotask prevents the state updates from occurring
   * synchronously during the effect execution itself.
   */
  useEffect(() => {
    const load = () => {
      void fetchData(false)
    }

    queueMicrotask(load)
  }, [fetchData])

  /*
   * Automatic polling.
   */
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchData(true)
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [fetchData])

  /*
   * Refresh when the user returns to the browser tab.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchData(true)
      }
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
    }
  }, [fetchData])

  /*
   * Manual dashboard refresh.
   */
  const refresh = useCallback(async () => {
    await fetchData(false)
  }, [fetchData])

  /*
   * Check out a visit and optimistically update the dashboard.
   */
  const checkOut = useCallback(
    async (visitId: string) => {
      setCheckingOutVisitId(visitId)

      try {
        await dashboardApi.checkOut(visitId)

        setData((previous) => {
          if (!previous) {
            return previous
          }

          const activeVisit = previous.activeVisitors.find(
            (visit) => visit.id === visitId,
          )

          const overdueVisit = previous.overdueVisitors.find(
            (visit) => visit.id === visitId,
          )

          const checkedOutVisit =
            activeVisit ?? overdueVisit

          if (!checkedOutVisit) {
            return previous
          }

          const updatedVisit = {
            ...checkedOutVisit,
            status: 'CHECKED_OUT',
            checkOutTime: new Date().toISOString(),
          }

          return {
            ...previous,

            summary: {
              ...previous.summary,

              currentlyOnPremises: Math.max(
                0,
                previous.summary.currentlyOnPremises - 1,
              ),

              checkedOutToday:
                previous.summary.checkedOutToday + 1,

              overdueCount: overdueVisit
                ? Math.max(
                    0,
                    previous.summary.overdueCount - 1,
                  )
                : previous.summary.overdueCount,
            },

            activeVisitors:
              previous.activeVisitors.filter(
                (visit) => visit.id !== visitId,
              ),

            overdueVisitors:
              previous.overdueVisitors.filter(
                (visit) => visit.id !== visitId,
              ),

            recentlyCheckedOut: [
              updatedVisit,
              ...previous.recentlyCheckedOut,
            ].slice(0, 10),
          }
        })
      } catch {
        /*
         * If checkout fails, synchronize with the server.
         */
        await fetchData(true)
      } finally {
        setCheckingOutVisitId(null)
      }
    },
    [fetchData],
  )

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    checkOut,
    checkingOutVisitId,
  }
}
