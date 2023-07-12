import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { size, map } from 'lodash'
import { InstitutionType } from 'types/institutions'
import { selectInstitution } from 'hooks/useKeycloak'
import ModalBase, {
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import classes from './classes.module.scss'

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
  // No need to fetch, if institutions are passed as a prop

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
    <ModalBase
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
    </ModalBase>
  )
}

export default InstitutionSelectModal
