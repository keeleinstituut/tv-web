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
import { useVendorsFetch } from 'hooks/requests/useVendors'
import SelectVendorsTable from 'components/organisms/tables/SelectVendorsTable/SelectVendorsTable'
import { FilterFunctionType } from 'types/collective'
import TextInput from 'components/molecules/TextInput/TextInput'
import { Root } from '@radix-ui/react-form'

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
      <div className={classes.filterSection}>
        <TextInput
          name={'search'}
          ariaLabel={t('label.search_by_name')}
          placeholder={t('placeholder.search_by_name')}
          value={searchValue}
          onChange={handleSearchVendors}
          className={classes.searchInput}
          isSearch
        />
        <Button
          onClick={handleClearFilters}
          appearance={AppearanceTypes.Secondary}
          size={SizeTypes.S}
          children={t('button.clear_filters')}
          className={classes.clearFiltersButton}
        />
      </div>
      <p>{t('modal.choose_vendors_helper')}</p>
    </div>
  )
  // Component
}

export interface SelectVendorModalProps {
  isModalOpen?: boolean
  taskId?: string
  selectedVendorsIds?: string[]
}

const SelectVendorModal: FC<SelectVendorModalProps> = ({
  taskId,
  selectedVendorsIds = [],
  isModalOpen,
}) => {
  const { t } = useTranslation()
  // TODO: add prices fetch here instead
  const {
    vendors,
    paginationData,
    isLoading,
    // isFetching,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useVendorsFetch()

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
      {/* <SelectVendorsTable
        data={vendors}
        {...{
          paginationData,
          handleFilterChange,
          handleSortingChange,
          handlePaginationChange,
          selectedVendorsIds,
        }}
      /> */}
    </ModalBase>
  )
}

export default SelectVendorModal
