import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { find, sortBy } from 'lodash'
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
import ChatIcon from 'assets/icons/chat_comment.svg?react'
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

interface ExternalVendorRequestsSectionProps {
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

const ExternalVendorRequestsSection: FC<ExternalVendorRequestsSectionProps> = ({
  requests,
  isAssignmentFinished,
  className,
}) => {
  const { t } = useTranslation()

  const rows = useMemo<Row[]>(() => {
    const flat: Row[] = []
    requests.forEach((r) => {
      const orderedOffers = sortBy(r.offers ?? [], (o) => o.position)
      const requestCancelled = r.status === OutsourceRequestStatus.Cancelled
      orderedOffers.forEach((offer) => {
        flat.push({
          request_id: r.id,
          offer_id: offer.id,
          institution_name: offer.institution?.name ?? offer.institution_id,
          status: offer.status,
          request_cancelled: requestCancelled,
          price: offer.price,
          response_comment: offer.response_comment,
          deadline_at: offerDeadline(r, offer.notified_at),
        })
      })
    })
    return flat
  }, [requests])

  const activeRequest = useMemo(
    () => find(requests, (r) => r.status === OutsourceRequestStatus.Active),
    [requests]
  )

  const handleOpenWinnerModal = useCallback(() => {
    if (!activeRequest) return
    showModal(ModalTypes.SelectWinningVendor, {
      requestId: activeRequest.id,
    })
  }, [activeRequest])

  const handleOpenCancelModal = useCallback(() => {
    if (!activeRequest) return
    showModal(ModalTypes.ConfirmCancelRequest, {
      requestId: activeRequest.id,
    })
  }, [activeRequest])

  const handleOpenResponseModal = useCallback(
    (requestId: string, offerId: string) => {
      showModal(ModalTypes.ViewVendorResponse, {
        requestId,
        offerId,
      })
    },
    []
  )

  const rowClassFor = (row: Row) => {
    if (row.request_cancelled) return classes.declinedRow
    if (row.status === OutsourceOfferStatus.RequestDeclined)
      return classes.declinedRow
    if (row.status === OutsourceOfferStatus.RequestExpired)
      return classes.expiredRow
    return undefined
  }

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('institution_name', {
          header: () => t('requests.table.organisation_name'),
          cell: ({ row, getValue }) => (
            <span className={rowClassFor(row.original)}>{getValue()}</span>
          ),
        }),
        columnHelper.accessor('status', {
          header: () => t('requests.table.status'),
          cell: ({ row, getValue }) => (
            <span className={rowClassFor(row.original)}>
              {row.original.request_cancelled
                ? t('requests.request_status.CANCELLED')
                : t(`requests.offer_status.${getValue()}`)}
            </span>
          ),
        }),
        columnHelper.accessor('deadline_at', {
          header: () => t('requests.table.response_deadline'),
          cell: ({ row, getValue }) => (
            <span className={rowClassFor(row.original)}>
              {formatDateTime(getValue())}
            </span>
          ),
        }),
        columnHelper.accessor('price', {
          header: () => t('requests.table.cost'),
          cell: ({ row, getValue }) => (
            <div
              className={classNames(
                classes.costCell,
                rowClassFor(row.original)
              )}
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

  if (!requests.length) return null

  const showCascadeExhaustedBanner =
    !!activeRequest &&
    activeRequest.mode === OutsourceRequestMode.Cascade &&
    activeRequest.is_cascade_exhausted

  return (
    <div className={classNames(classes.container, className)}>
      <DataTable
        data={rows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.tableContainer}
        hidePagination
        headComponent={<h4>{t('requests.section_title')}</h4>}
      />
      {showCascadeExhaustedBanner && (
        <p className={classes.cascadeExhausted}>
          {t('requests.cascade_exhausted_notice')}
        </p>
      )}
      {activeRequest && !isAssignmentFinished && (
        <div className={classes.actionsRow}>
          <Button
            appearance={AppearanceTypes.Secondary}
            size={SizeTypes.S}
            onClick={handleOpenCancelModal}
            className={classes.cancelButton}
          >
            {t('requests.cancel_request')}
          </Button>
          <Button
            appearance={AppearanceTypes.Primary}
            size={SizeTypes.S}
            onClick={handleOpenWinnerModal}
          >
            {t('requests.select_winner_button')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ExternalVendorRequestsSection
