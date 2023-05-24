import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { size, map } from 'lodash'
import { InstitutionType } from 'types/institutions'
import { selectInstitution } from 'hooks/useKeycloak'
import Modal, { TitleFontTypes } from 'components/organisms/Modal/Modal'
import classes from './styles.module.scss'

export interface InstitutionSelectModalProps {
  onClose?: () => void
  institutions?: InstitutionType[]
  isModalOpen?: boolean
  closeModal: () => void
  onSelect?: () => void
}

const InstitutionSelectModal: FC<InstitutionSelectModalProps> = ({
  institutions,
  onClose,
  isModalOpen,
  closeModal,
  onSelect,
}) => {
  const [loadingSelect, setLoadingSelect] = useState<string>()
  // TODO: move fetching of institutions to this component later
  // Currently we do it after initializing keycloak, so we can attempt automatic picking of institution
  const { t } = useTranslation()
  const handleClose = useCallback(() => {
    closeModal()
    if (onClose) {
      onClose()
    }
  }, [closeModal, onClose])

  const handleSelectInstitution = useCallback(
    async (id: string) => {
      setLoadingSelect(id)
      await selectInstitution(id)
      setLoadingSelect('')
      if (onSelect) {
        onSelect()
      }
      closeModal()
    },
    [closeModal, onSelect]
  )

  return (
    <Modal
      title={
        size(institutions) === 0
          ? t('modal.no_institutions_title')
          : t('modal.pick_institution_title')
      }
      titleFont={TitleFontTypes.Black}
      topButton={true}
      handleClose={handleClose}
      open={!!isModalOpen}
      className={classes.modalContent}
    >
      <h2>{t('modal.institutions')}</h2>
      {map(institutions, ({ name, id }) => (
        <Button
          appearance={AppearanceTypes.Secondary}
          className={classes.institution}
          onClick={() => handleSelectInstitution(id)}
          loading={loadingSelect === id}
          disabled={!!loadingSelect}
          key={id}
        >
          {name}
        </Button>
      ))}
    </Modal>
  )
}

export default InstitutionSelectModal
