import { FC, useCallback, useMemo, useState } from 'react'
import {
  map,
  filter,
  compact,
  isEmpty,
  keyBy,
  split,
  join,
  toNumber,
  debounce,
  includes,
} from 'lodash'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { useTranslation } from 'react-i18next'
import { AppearanceTypes } from 'components/molecules/Button/Button'
import { Root } from '@radix-ui/react-form'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import TextInput from 'components/molecules/TextInput/TextInput'
import InstitutionPartnersEditTable, {
  InstitutionRow,
} from 'components/organisms/tables/InstitutionPartnersEditTable/InstitutionPartnersEditTable'
import { useAuth } from 'components/contexts/AuthContext'
import { useTranslationOrderInstitutions } from 'hooks/requests/useInstitutions'
import {
  useFetchInstitutionPartners,
  useCreateInstitutionPartners,
  useDeleteInstitutionPartners,
} from 'hooks/requests/useInstitutionPartners'
import Loader from 'components/atoms/Loader/Loader'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { InstitutionPartnerFilters } from 'types/outsourceRequests'
import classes from './classes.module.scss'

export interface InstitutionPartnersEditModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  partnersFilters?: InstitutionPartnerFilters
}

type FormValues = {
  [institutionId: string]: {
    isPartner: boolean
    partner_id: string
  }
}

const InstitutionPartnersEditModal: FC<InstitutionPartnersEditModalProps> = ({
  isModalOpen,
  closeModal,
  partnersFilters,
}) => {
  const { t } = useTranslation()
  const { userInfo } = useAuth()
  const ownInstitutionId = userInfo?.tolkevarav?.selectedInstitution?.id
  const [searchValue, setSearchValue] = useState<string>('')

  const {
    institutions,
    paginationData,
    handlePaginationChange,
    handleFilterChange,
    isLoading: isInstitutionsLoading,
  } = useTranslationOrderInstitutions({ per_page: 10, page: 1 }, false)

  const { partners, isLoading: isPartnersLoading } = useFetchInstitutionPartners(
    { per_page: 50, page: 1 },
    false
  )

  const isLoading = isInstitutionsLoading || isPartnersLoading

  const partnersByInstitutionId = useMemo(
    () => keyBy(partners, 'partner_institution_id'),
    [partners]
  )

  const { createInstitutionPartners } =
    useCreateInstitutionPartners(partnersFilters)
  const { deleteInstitutionPartners } =
    useDeleteInstitutionPartners(partnersFilters)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(handleFilterChange, 300, { leading: false, trailing: true }),
    [handleFilterChange]
  )

  const handleSearch = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debouncedSearch({ name: event.target.value })
    },
    [debouncedSearch]
  )

  const resetSearch = () => {
    setSearchValue('')
    handleFilterChange({ name: '' })
  }

  const tableData = useMemo(
    (): InstitutionRow[] =>
      map(
        filter(institutions, (inst) => inst.id !== ownInstitutionId),
        (inst) => ({
          institutionId: inst.id,
          name: inst.name,
          short_name: inst.short_name,
          partner_id: partnersByInstitutionId[inst.id]?.id,
        })
      ),
    [institutions, partnersByInstitutionId, ownInstitutionId]
  )

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty },
  } = useForm<FormValues>({ mode: 'onChange' })

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const toAdd = compact(
      map(data, ({ isPartner, partner_id }, institutionId) => {
        if (isPartner && !partner_id) return institutionId
      })
    )

    const toRemove = compact(
      map(data, ({ isPartner, partner_id }) => {
        if (!isPartner && !!partner_id) return partner_id
      })
    )

    const newPayload = { data: map(toAdd, (id) => ({ partner_institution_id: id })) }
    const deletePayload = { id: toRemove }

    const allPromise = Promise.all([
      !isEmpty(toRemove) && deleteInstitutionPartners(deletePayload),
      !isEmpty(toAdd) && createInstitutionPartners(newPayload),
    ])

    try {
      if (!isEmpty(toAdd) || !isEmpty(toRemove)) {
        await allPromise
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.institution_partners_updated'),
        })
      }
      closeModal()
    } catch (errorData) {
      const typedErrorData = errorData as ValidationError
      if (typedErrorData.errors) {
        map(typedErrorData.errors, (errorsArray, key) => {
          const typedKey = key as FieldPath<FormValues>
          const tKey = split(typedKey, '.')[1]
          const fieldId = includes(typedKey, 'partner_institution_id')
            ? toAdd[toNumber(tKey)]
            : toRemove[toNumber(tKey)]
          const errorString = join(errorsArray, ',')
          setError(fieldId, { type: 'backend', message: errorString })
        })
      }
    }
  }

  return (
    <ModalBase
      title={t('label.add_remove_institution_partner')}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.Narrow}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('button.cancel'),
          onClick: () => {
            closeModal()
            reset()
            resetSearch()
          },
        },
        {
          appearance: AppearanceTypes.Primary,
          children: t('button.confirm'),
          type: 'submit',
          form: 'institution-partners',
          disabled: !isDirty,
        },
      ]}
    >
      <Root id="institution-partners" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          name="search"
          ariaLabel={t('label.search')}
          placeholder={t('placeholder.search_by_name')}
          value={searchValue}
          onChange={handleSearch}
          className={classes.searchInput}
          isSearch
        />
        <Loader loading={isLoading} />
        {!isLoading && (
          <InstitutionPartnersEditTable
            data={tableData}
            control={control}
            paginationData={paginationData}
            handlePaginationChange={handlePaginationChange}
          />
        )}
      </Root>
    </ModalBase>
  )
}

export default InstitutionPartnersEditModal
