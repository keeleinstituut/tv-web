import { FC, useCallback, useState } from 'react'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { debounce } from 'lodash'
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
import { Root } from '@radix-ui/react-form'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'

// TODO: this is WIP code for suborder view

interface ModalHeadSectionProps {
  handleFilterChange: (value?: FilterFunctionType) => void
}

const ModalHeadSection: FC<ModalHeadSectionProps> = ({
  handleFilterChange,
}) => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>()

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debounce(handleFilterChange, 300)({ name: event.target.value })
      // TODO: not sure yet whether filtering param will be name
    },
    [handleFilterChange]
  )

  const handleClearFilters = useCallback(() => {
    // TODO: clear all filters
  }, [])

  return (
    <div className={classes.modalHeadContainer}>
      <h1>{t('modal.choose_vendors')}</h1>
      <TextInput
        name={'search'}
        ariaLabel={t('label.search_by_name')}
        placeholder={t('placeholder.search_by_name')}
        value={searchValue}
        onChange={handleSearchVendors}
        className={classes.searchInput}
        isSearch
      />
      <p>{t('modal.choose_vendors_helper')}</p>
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
  taskId?: string
  selectedVendorsIds?: string[]
  taskSkills?: string[]
  source_language_classifier_value_id?: string
  destination_language_classifier_value_id?: string
}

const SelectVendorModal: FC<SelectVendorModalProps> = ({
  taskId,
  selectedVendorsIds = [],
  taskSkills = [],
  isModalOpen,
  source_language_classifier_value_id,
  destination_language_classifier_value_id,
}) => {
  const { t } = useTranslation()
  // TODO: add prices fetch here instead
  const {
    prices,
    paginationData,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useAllPricesFetch()

  const handleAddSelectedVendors = useCallback(() => {
    // TODO: probably saving function passed in from outside
    // SO here we are most likely just going to submit the table form
  }, [])

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
          onClick: handleAddSelectedVendors,
          children: t('button.add'),
        },
      ]}
      headComponent={
        <Root>
          <ModalHeadSection handleFilterChange={handleFilterChange} />
        </Root>
      }
    >
      <SelectVendorsTable
        data={prices}
        {...{
          paginationData,
          handleFilterChange,
          handleSortingChange,
          handlePaginationChange,
          selectedVendorsIds,
          taskSkills,
          source_language_classifier_value_id,
          destination_language_classifier_value_id,
        }}
      />
    </ModalBase>
  )
}

export default SelectVendorModal
