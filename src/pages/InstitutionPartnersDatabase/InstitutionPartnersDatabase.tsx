import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { includes } from 'lodash'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import InstitutionPartnersTable from 'components/organisms/tables/InstitutionPartnersTable/InstitutionPartnersTable'
import classes from './classes.module.scss'
import Tooltip from "../../components/organisms/Tooltip/Tooltip";

const InstitutionPartnersDatabase: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const handleOpenModal = useCallback(() => {
    showModal(ModalTypes.InstitutionPartnersEdit, {})
  }, [])

  return (
    <>
      <div className={classes.header}>
        <h1>{t('menu.institution_partners')}</h1>
        <Tooltip helpSectionKey="vendorsDatabase" />
        <Button
          onClick={handleOpenModal}
          appearance={AppearanceTypes.Secondary}
          hidden={!includes(userPrivileges, Privileges.ManageExternalPartner)}
        >
          {t('label.add_remove_institution_partner')}
        </Button>
      </div>
      <InstitutionPartnersTable />
    </>
  )
}

export default InstitutionPartnersDatabase
