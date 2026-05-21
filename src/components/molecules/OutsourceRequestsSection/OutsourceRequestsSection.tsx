import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { orderBy, sortBy, toLower } from 'lodash'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import Tag from 'components/atoms/Tag/Tag'
import ChatIcon from 'assets/icons/chat_comment.svg?react'
import DropdownArrow from 'assets/icons/arrow_down.svg?react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import {
  OutsourceOfferStatus,
  OutsourceRequest,
  OutsourceRequestMode,
  OutsourceRequestStatus,
} from 'types/outsourceRequests'

import classes from './classes.module.scss'

type Row = {
  request_id: string
  offer_id: string
  institution_name: string
  status: OutsourceOfferStatus
  request_cancelled: boolean
  price?: number | null
  response_comment?: string | null
  deadline_at?: string | null
}

const columnHelper = createColumnHelper<Row>()

interface OutsourceRequestsSectionProps {
  requests: OutsourceRequest[]
  isAssignmentFinished?: boolean
  className?: string
}

const formatPrice = (price?: number | null) =>
  price !== undefined && price !== null && Number.isFinite(price)
    ? `${price}€`
    : '-'

const formatDateTime = (iso?: string | null) =>
  iso ? dayjs(iso).format('DD.MM.YYYY HH:mm') : '-'

const offerDeadline = (
  request: OutsourceRequest,
  notifiedAt?: string | null
): string | null => {
  if (request.mode === OutsourceRequestMode.Cascade) {
    if (!notifiedAt) return null
    return dayjs(notifiedAt)
      .add(request.reaction_time_minutes, 'minute')
      .toISOString()
  }
  return request.deadline_at ?? null
}

const buildRowsForRequest = (request: OutsourceRequest): Row[] => {
  const requestCancelled = request.status === OutsourceRequestStatus.Cancelled
  return sortBy(request.offers ?? [], (o) => o.position).map((offer) => ({
    request_id: request.id,
    offer_id: offer.id,
    institution_name: offer.institution?.name ?? offer.institution_id,
    status: offer.status,
    request_cancelled: requestCancelled,
    price: offer.price,
    response_comment: offer.response_comment,
    deadline_at: offerDeadline(request, offer.notified_at),
  }))
}

const OutsourceRequestsSection: FC<OutsourceRequestsSectionProps> = ({
  requests,
  isAssignmentFinished,
  className,
}) => {
  const { t } = useTranslation()

  const sortedRequests = useMemo(
    () => orderBy(requests, (r) => r.created_at, 'desc'),
    [requests]
  )

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(sortedRequests.length ? [sortedRequests[0].id] : [])
  )

  const toggleRequest = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleOpenWinnerModal = useCallback((requestId: string) => {
    showModal(ModalTypes.SelectOutsourceOffer, { requestId })
  }, [])

  const handleOpenCancelModal = useCallback((requestId: string) => {
    showModal(ModalTypes.ConfirmCancelRequest, { requestId })
  }, [])

  const handleOpenResponseModal = useCallback(
    (requestId: string, offerId: string) => {
      showModal(ModalTypes.ViewVendorResponse, { requestId, offerId })
    },
    []
  )


  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('institution_name', {
          header: () => t('requests.table.organisation_name'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
        }),
        columnHelper.accessor('status', {
          header: () => t('requests.table.status'),
          cell: ({ row, getValue }) => (
            <span>
              {row.original.request_cancelled
                ? t('requests.request_status.CANCELLED')
                : t(`requests.offer_status.${getValue()}`)}
            </span>
          ),
        }),
        columnHelper.accessor('deadline_at', {
          header: () => t('requests.table.response_deadline'),
          cell: ({ getValue }) => <span>{formatDateTime(getValue())}</span>,
        }),
        columnHelper.accessor('price', {
          header: () => t('requests.table.cost'),
          cell: ({ row, getValue }) => (
            <div
              className={classes.costCell}
            >
              <span>{formatPrice(getValue())}</span>
              {row.original.response_comment ? (
                <BaseButton
                  className={classes.chatButton}
                  onClick={() =>
                    handleOpenResponseModal(
                      row.original.request_id,
                      row.original.offer_id
                    )
                  }
                  aria-label={t('requests.view_response_title')}
                >
                  <ChatIcon />
                </BaseButton>
              ) : null}
            </div>
          ),
        }),
      ] as ColumnDef<Row>[],
    [t, handleOpenResponseModal]
  )

  if (!sortedRequests.length) return null

  return (
    <div className={classNames(classes.container, className)}>
      <h4 className={classes.sectionTitle}>{t('requests.section_title')}</h4>
      {sortedRequests.map((request, index) => {
        const rows = buildRowsForRequest(request)
        if (!rows.length) return null

        const isExpanded = expandedIds.has(request.id)
        const isActive = request.status === OutsourceRequestStatus.Active
        const requestNumber = sortedRequests.length - index
        const showCascadeBanner =
          isActive &&
          request.mode === OutsourceRequestMode.Cascade &&
          request.is_cascade_exhausted

        return (
          <div key={request.id} className={classes.requestRow}>
            <div className={classes.requestRowHeader}>
              <BaseButton
                className={classes.requestToggle}
                onClick={() => toggleRequest(request.id)}
              >
                <DropdownArrow
                  className={classNames(
                    classes.requestArrow,
                    isExpanded && classes.requestArrowExpanded
                  )}
                />
                <span className={classes.requestTitle}>
                  {t('requests.request_label', { number: requestNumber })}
                </span>
                <Tag
                  label={t(`requests.request_status.${request.status}`)}
                  className={classes[toLower(request.status)]}
                />
                <span className={classes.requestPrice}>
                  <span className={classes.requestPriceLabel}>
                    {t('requests.table.cost')}:
                  </span>
                  {formatPrice(request.price)}
                </span>
              </BaseButton>
              {isActive && !isAssignmentFinished && (
                <div className={classes.actionsRow}>
                  <Button
                    appearance={AppearanceTypes.Secondary}
                    size={SizeTypes.S}
                    onClick={() => handleOpenCancelModal(request.id)}
                    className={classes.cancelButton}
                  >
                    {t('requests.cancel_request')}
                  </Button>
                  <Button
                    appearance={AppearanceTypes.Primary}
                    size={SizeTypes.S}
                    onClick={() => handleOpenWinnerModal(request.id)}
                  >
                    {t('requests.select_winner_button')}
                  </Button>
                </div>
              )}
            </div>

            {showCascadeBanner && (
              <p className={classes.cascadeExhausted}>
                {t('requests.cascade_exhausted_notice')}
              </p>
            )}

            {isExpanded && (
              <div className={classes.requestContent}>
                <DataTable
                  data={rows}
                  columns={columns}
                  tableSize={TableSizeTypes.M}
                  className={classes.tableContainer}
                  hidePagination
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default OutsourceRequestsSection
