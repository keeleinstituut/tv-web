import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import Container from 'components/atoms/Container/Container'
import PersonSection, {
  PersonSectionTypes,
} from 'components/molecules/PersonSection/PersonSection'
import DetailsSection from 'components/molecules/DetailsSection/DetailsSection'
import FilesSection from 'components/molecules/FilesSection/FilesSection'
import { useForm } from 'react-hook-form'
import { UserType } from 'types/users'
import { Privileges } from 'types/privileges'
interface FormValues {
  client_id: string
  manager_id: string
  type_classifier_value_id: string
  translation_domain: string
  start?: { date?: string; time?: string }
  deadline: { date?: string; time?: string }
  comments?: string
  reference_number?: string
  source_language_classifier_id: string
  destination_language_classifier_id: string[]
}

interface OrderDetailsProps {
  isNew?: boolean
}

const OrderDetails: FC<OrderDetailsProps> = ({ isNew }) => {
  const { t } = useTranslation()
  const { institutionUserId } = useAuth()

  const {
    control,
    watch,
    // handleSubmit,
    // reset,
    // formState: { isSubmitting, isValid },
    // setError,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: {
      client_id: institutionUserId,
    },
  })

  const { client_id, manager_id } = watch()

  return (
    <>
      <Container
        className={classNames(
          classes.peopleContainer,
          !isNew && classes.overwriteContainerStyles
        )}
      >
        <PersonSection
          type={PersonSectionTypes.Client}
          control={control}
          selectedUserId={client_id}
        />
        <PersonSection
          type={PersonSectionTypes.Manager}
          control={control}
          selectedUserId={manager_id}
        />
      </Container>
      <Container
        className={classNames(
          classes.detailsContainer,
          !isNew && classes.overwriteContainerStyles
        )}
      >
        <h2>{t('orders.new_orders')}</h2>
        <DetailsSection control={control} />
        <FilesSection control={control} />
      </Container>
    </>
  )
}

export default OrderDetails
