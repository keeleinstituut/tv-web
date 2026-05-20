import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'

import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { AppearanceTypes } from 'components/molecules/Button/Button'
import Loader from 'components/atoms/Loader/Loader'
import TextInput from 'components/molecules/TextInput/TextInput'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import i18n from 'i18n/i18n'
import {
  useFetchOutsourceRequest,
  useSelectOutsourceOffer,
} from 'hooks/requests/useProjectRequests'
import { OutsourceOfferStatus } from 'types/projectRequests'

import classes from './classes.module.scss'

export interface SelectWinningVendorModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  requestId: string
}

const DEFAULT_REJECTION_COMMENT = () =>
  i18n.t('requests.winner_selection_default_comment') as string

const formatPrice = (price?: number | null) =>
  price !== undefined && price !== null && Number.isFinite(price)
    ? `${price}€`
    : '-'

const SelectWinningVendorModal: FC<SelectWinningVendorModalProps> = ({
  isModalOpen,
  closeModal,
  requestId,
}) => {
  const { t } = useTranslation()
  const { request, isLoading } = useFetchOutsourceRequest(requestId)
  const { selectOutsourceOffer, isLoading: isSubmitting } =
    useSelectOutsourceOffer(requestId)

  const [winnerId, setWinnerId] = useState<string | undefined>()
  const [rejectionComments, setRejectionComments] = useState<
    Record<string, string>
  >({})

  useEffect(() => {
    if (!request) return
    setWinnerId(undefined)
    setRejectionComments({})
  }, [request?.id])

  const offers = useMemo(() => request?.offers ?? [], [request?.offers])

  const loserOffers = useMemo(
    () =>
      offers.filter(
        (o) =>
          o.id !== winnerId && o.status === OutsourceOfferStatus.RequestAccepted
      ),
    [offers, winnerId]
  )

  useEffect(() => {
    if (!winnerId) return
    const defaultComment = DEFAULT_REJECTION_COMMENT()
    setRejectionComments((prev) => {
      const next: Record<string, string> = {}
      loserOffers.forEach((o) => {
        next[o.id] = prev[o.id] ?? defaultComment
      })
      return next
    })
  }, [winnerId, loserOffers])

  const allRejectionCommentsFilled = loserOffers.every(
    (o) => (rejectionComments[o.id] ?? '').trim().length > 0
  )

  const handleRejectionCommentChange = useCallback(
    (offerId: string, value: string) => {
      setRejectionComments((prev) => ({ ...prev, [offerId]: value }))
    },
    []
  )

  const handleSubmit = useCallback(async () => {
    if (!winnerId) return
    const rejection_comments = loserOffers.map((o) => ({
      offer_id: o.id,
      rejection_comment: (rejectionComments[o.id] ?? '').trim(),
    }))

    try {
      await selectOutsourceOffer({
        offer_id: winnerId,
        rejection_comments,
      })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('requests.winner_success'),
      })
      closeModal()
    } catch (error) {
      showValidationErrorMessage(error)
    }
  }, [
    winnerId,
    loserOffers,
    rejectionComments,
    selectOutsourceOffer,
    t,
    closeModal,
  ])

  const isSelectable = (status: OutsourceOfferStatus) =>
    status === OutsourceOfferStatus.RequestAccepted

  return (
    <ModalBase
      open={!!isModalOpen}
      titleFont={TitleFontTypes.Gray}
      size={ModalSizeTypes.ExtraLarge}
      title={t('requests.winner_modal_title')}
      helperText={t('requests.winner_modal_subtitle')}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('requests.cancel_button'),
          onClick: closeModal,
        },
        {
          appearance: AppearanceTypes.Primary,
          children: t('requests.confirm_vendor'),
          onClick: handleSubmit,
          disabled: !winnerId || !allRejectionCommentsFilled,
          loading: isSubmitting,
        },
      ]}
    >
      {isLoading || !request ? (
        <Loader loading />
      ) : (
        <div className={classes.recipientList}>
          {offers.map((offer) => {
            const selectable = isSelectable(offer.status)
            const isWinner = offer.id === winnerId
            const price = offer.proposed_price ?? offer.calculated_price
            const showRejection = !!winnerId && !isWinner && selectable
            const rejectionValue = rejectionComments[offer.id] ?? ''
            const rejectionEmpty =
              showRejection && rejectionValue.trim().length === 0
            return (
              <label
                key={offer.id}
                className={classNames(
                  classes.recipientCard,
                  isWinner && classes.recipientCardWinner,
                  !selectable && classes.recipientCardDisabled
                )}
              >
                <div className={classes.recipientHeader}>
                  <div className={classes.recipientNameBlock}>
                    <input
                      type="radio"
                      className={classes.recipientRadio}
                      name="winning_recipient"
                      value={offer.id}
                      checked={isWinner}
                      onChange={() => setWinnerId(offer.id)}
                      disabled={!selectable}
                    />
                    <span className={classes.recipientName}>
                      {offer.institution?.name ?? offer.institution_id}
                    </span>
                  </div>
                  <span className={classes.statusBadge}>
                    {t(`requests.offer_status.${offer.status}`)}
                  </span>
                </div>
                <div className={classes.recipientMeta}>
                  <span className={classes.metaLabel}>
                    {t('requests.recipient_cost', {
                      price: formatPrice(price),
                    })}
                  </span>
                  <span className={classes.metaSeparator}>/</span>
                  <span className={classes.metaComment}>
                    {t('requests.recipient_comment_prefix')}{' '}
                    {offer.response_comment
                      ? `“${offer.response_comment}”`
                      : '"-"'}
                  </span>
                </div>
                {showRejection && (
                  <div
                    className={classes.rejectionField}
                    onClick={(e) => e.preventDefault()}
                  >
                    <TextInput
                      name={`rejection_comment_${offer.id}`}
                      ariaLabel={t('requests.rejection_comment_label')}
                      label={t('requests.rejection_comment_label')}
                      placeholder={t('requests.rejection_comment_label')}
                      value={rejectionValue}
                      onChange={(e) =>
                        handleRejectionCommentChange(offer.id, e.target.value)
                      }
                      isTextarea
                      error={
                        rejectionEmpty
                          ? {
                              type: 'required',
                              message: t('requests.rejection_comment_required'),
                            }
                          : undefined
                      }
                    />
                  </div>
                )}
              </label>
            )
          })}
        </div>
      )}
    </ModalBase>
  )
}

export default SelectWinningVendorModal
