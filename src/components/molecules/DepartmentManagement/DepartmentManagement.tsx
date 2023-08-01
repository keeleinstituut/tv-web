import Container from 'components/atoms/Container/Container'
import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { useDepartmentsFetch } from 'hooks/requests/useDepartments'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { map } from 'lodash'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'

const DepartmentManagement: FC = () => {
  const { t } = useTranslation()
  const { existingDepartments } = useDepartmentsFetch()

  // const existingDepartments = [
  //   { name: 'talu', id: 1 },
  //   { name: 'laut', id: 2 },
  // ]
  console.log(existingDepartments)

  const handleEditDepartmentsModal = () => {
    console.log('click')
  }

  return (
    <Container className={classes.departmentContainer}>
      <div className={classes.departmentHeader}>
        <span className={classes.department}>
          {t('cheat_sheet.institution_management.departments')}
        </span>
        <Button
          appearance={AppearanceTypes.Text}
          className={classes.editButton}
          onClick={handleEditDepartmentsModal}
          icon={EditIcon}
        >
          <span>{t('button.change')}</span>
        </Button>
      </div>
      <div>
        {existingDepartments &&
          map(existingDepartments, ({ name, id }) => <p key={id}>{name}</p>)}
      </div>
    </Container>
  )
}

export default DepartmentManagement
