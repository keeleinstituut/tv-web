import { BreadcrumbComponentProps } from 'use-react-router-breadcrumbs'
import { useFetchCalendarOrderDetail } from 'hooks/requests/useCalendar'

const CalendarOrderBreadcrumb = <ParamKey extends string = string>({
  match,
}: BreadcrumbComponentProps<ParamKey>) => {
  const { orderId } = (match?.params || {}) as { orderId?: string }
  const { order } = useFetchCalendarOrderDetail(orderId ?? null)
  return <span>{order?.ext_id ?? orderId}</span>
}

export default CalendarOrderBreadcrumb
