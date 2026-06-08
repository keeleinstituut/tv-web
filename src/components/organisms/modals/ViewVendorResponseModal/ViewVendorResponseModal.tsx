import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { find } from 'lodash'

import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { AppearanceTypes } from 'components/molecules/Button/Button'
import Loader from 'components/atoms/Loader/Loader'
import { useFetchOutsourceRequest } from 'hooks/requests/useOutsourceRequests'

import classes from './classes.module.scss'

export interface ViewVendorResponseModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  requestId: string
  offerId: string
}

const ViewVendorResponseModal: FC<ViewVendorResponseModalProps> = ({
  isModalOpen,
  closeModal,
  requestId,
  offerId,
}) => {
  const { t } = useTranslation()
  const { request, isLoading } = useFetchOutsourceRequest(requestId)
  const offer = find(request?.offers, { id: offerId })

  const displayedPrice = offer?.price
  const priceText =
    displayedPrice !== null &&
    displayedPrice !== undefined &&
    Number.isFinite(displayedPrice)
      ? `${displayedPrice}€`
      : '—'

  return (
    <ModalBase
      open={!!isModalOpen}
      titleFont={TitleFontTypes.Gray}
      size={ModalSizeTypes.Medium}
      title={t('requests.view_response_title')}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('requests.cancel_button'),
          onClick: closeModal,
        },
      ]}
    >
      {isLoading || !offer ? (
        <Loader loading />
      ) : (
        <div className={classes.body}>
          <div className={classes.headerRow}>
            <span className={classes.vendorName}>
              {offer.institution?.name ?? offer.institution_id}
            </span>
            <span className={classes.statusBadge}>
              {t(`requests.offer_status.${offer.status}`)}
            </span>
          </div>

          <div className={classes.fieldGroup}>
            <label className={classes.fieldLabel}>
              {t('requests.field_price')}
            </label>
            <div className={classes.readonlyInput}>{priceText}</div>
          </div>

          <div className={classes.fieldGroup}>
            <label className={classes.fieldLabel}>
              {t('requests.field_response_comment')}
            </label>
            <div className={classes.readonlyTextarea}>
              {offer.response_comment || offer.decline_comment || '—'}
            </div>
          </div>
        </div>
      )}
    </ModalBase>
  )
}

export default ViewVendorResponseModal
