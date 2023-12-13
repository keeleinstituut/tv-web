import { FC, useCallback, useState, useEffect } from 'react'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
} from 'components/organisms/ModalBase/ModalBase'
import {
  debounce,
  pickBy,
  keys,
  filter,
  includes,
  isEmpty,
  difference,
  omitBy,
} from 'lodash'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { closeModal } from '../ModalRoot'
import { useAllPricesFetch } from 'hooks/requests/useVendors'
import SelectVendorsTable from 'components/organisms/tables/SelectVendorsTable/SelectVendorsTable'
import { FilterFunctionType } from 'types/collective'
import TextInput from 'components/molecules/TextInput/TextInput'
import { showValidationErrorMessage } from 'api/errorHandler'
import { Root } from '@radix-ui/react-form'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useAssignmentAddVendor } from 'hooks/requests/useAssignments'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import Loader from 'components/atoms/Loader/Loader'

interface ModalHeadSectionProps {
  handleFilterChange: (value?: FilterFunctionType) => void
}

const ModalHeadSection: FC<ModalHeadSectionProps> = ({
  handleFilterChange,
}) => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>('')

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debounce(
        handleFilterChange,
        300
      )({ institution_user_name: event.target.value })
      // TODO: not sure yet whether filtering param will be name
    },
    [handleFilterChange]
  )

  const handleClearFilters = useCallback(() => {
    setSearchValue('')
    handleFilterChange({
      institution_user_name: '',
      lang_pair: [],
      skill_id: [],
      tag_id: [],
    })
  }, [handleFilterChange])

  return (
    <div className={classes.modalHeadContainer}>
      <h1>{t('modal.choose_vendors')}</h1>
      <TextInput
        name={'search'}
        ariaLabel={t('label.search_by_name')}
        placeholder={t('label.search_by_name')}
        value={searchValue}
        onChange={handleSearchVendors}
        className={classes.searchInput}
        inputContainerClassName={classes.searchInputInternal}
        isSearch
      />
      <p className={classes.helperText}>{t('modal.choose_vendors_helper')}</p>
      <div className={classes.row}>
        <Button
          onClick={handleClearFilters}
          appearance={AppearanceTypes.Secondary}
          size={SizeTypes.S}
          children={t('button.clear_filters')}
        />
        <SmallTooltip
          className={classes.tooltip}
          tooltipContent={t('tooltip.clear_price_filters')}
        />
      </div>
    </div>
  )
  // Component
}

export interface SelectVendorModalProps {
  isModalOpen?: boolean
  assignmentId?: string
  selectedVendorsIds?: string[]
  skill_id?: string
  source_language_classifier_value_id?: string
  destination_language_classifier_value_id?: string
}

interface FormValues {
  selected: { [key in string]?: boolean }
}

const SelectVendorModal: FC<SelectVendorModalProps> = ({
  assignmentId,
  selectedVendorsIds = [],
  skill_id,
  isModalOpen,
  source_language_classifier_value_id,
  destination_language_classifier_value_id,
}) => {
  const { t } = useTranslation()
  const { addAssignmentVendor, isLoading } = useAssignmentAddVendor({
    id: assignmentId,
  })
  const {
    prices,
    filters,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
    isLoading: isLoadingPrices,
  } = useAllPricesFetch(
    {
      lang_pair: [
        {
          src: source_language_classifier_value_id,
          dst: destination_language_classifier_value_id,
        },
      ],
      ...(skill_id ? { skill_id: [skill_id] } : {}),
    },
    false
  )

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    reValidateMode: 'onChange',
    mode: 'onChange',
  })

  const selectedValues = watch('selected')

  const checkedVendors = keys(omitBy(selectedValues, (isChecked) => !isChecked))

  const isDirty = !isEmpty(difference(checkedVendors, selectedVendorsIds))

  useEffect(() => {
    if (!isModalOpen) {
      reset()
    }
    // We only want to reset when modal closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen])

  const handleAddSelectedVendors: SubmitHandler<FormValues> = useCallback(
    async ({ selected }) => {
      const selectedVendorIds = keys(pickBy(selected, (val) => !!val))
      const newVendorIds = filter(
        selectedVendorIds,
        (id) => !includes(selectedVendorsIds, id)
      )
      try {
        // TODO: not sure about this at all
        await addAssignmentVendor({
          data: newVendorIds.map((id) => ({ vendor_id: id })),
        })
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.vendors_added_to_task'),
        })
        closeModal()
      } catch (errorData) {
        // Might map some errors to inputs from here, but not sure if it makes sense right now
        showValidationErrorMessage(errorData)
      }
    },
    [selectedVendorsIds, addAssignmentVendor, t]
  )

  return (
    <ModalBase
      open={!!isModalOpen}
      className={classes.modalContainer}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.ExtraLarge}
      innerWrapperClassName={classes.contentWrapper}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('button.quit'),
          onClick: closeModal,
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: handleSubmit(handleAddSelectedVendors),
          loading: isSubmitting || isLoading,
          disabled: !isValid || !isDirty,
          children: t('button.add'),
        },
      ]}
      headComponent={
        <Root>
          <ModalHeadSection handleFilterChange={handleFilterChange} />
        </Root>
      }
    >
      <Loader loading={isLoadingPrices} />

      <SelectVendorsTable
        data={prices}
        paginationData={paginationData}
        handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
        handlePaginationChange={handlePaginationChange}
        selectedVendorsIds={selectedVendorsIds}
        filters={filters}
        skill_id={skill_id}
        control={control}
        hidden={isLoadingPrices}
      />
    </ModalBase>
  )
}

export default SelectVendorModal
