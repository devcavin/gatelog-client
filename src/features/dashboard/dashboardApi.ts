import { apiClient } from '../../api/client'

export interface DashboardSummary {
  currentlyOnPremises: number
  checkedInToday: number
  checkedOutToday: number
  overdueCount: number
  overnightCount: number
  asOf: string
}

export interface VisitorProfileSummary {
  id: string
  name: string
  phone: string
}

export interface VisitResponse {
  id: string
  profile: VisitorProfileSummary
  visitorType: string
  purpose: string
  status: string
  siteId: string
  zoneId: string | null
  zoneName: string | null
  createdById: string
  createdByName: string
  checkInTime: string
  checkOutTime: string | null
  overnight: boolean
}

export interface DashboardFeed {
  summary: DashboardSummary
  activeVisitors: VisitResponse[]
  overdueVisitors: VisitResponse[]
  overnightVisitors: VisitResponse[]
  recentlyCheckedOut: VisitResponse[]
}

export const dashboardApi = {
  getFeed: () =>
    apiClient.get<DashboardFeed>('/api/dashboard'),

  checkOut: (visitId: string) =>
    apiClient.patch<VisitResponse>(`/api/visits/${visitId}/checkout`),
}