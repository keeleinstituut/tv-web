import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GeneralPriceListTable from 'components/organisms/tables/GeneralPriceListTable/GeneralPriceListTable'
import { useAllPricesFetch } from 'hooks/requests/useVendors'
import { UserStatus } from 'types/users'
import TextInput from 'components/molecules/TextInput/TextInput'
import { debounce } from 'lodash'
import { Root } from '@radix-ui/react-form'

import classes from './classes.module.scss'

export interface GeneralPriceListProps {
  isModalOpen?: boolean
  taskId?: string
  selectedVendorsIds?: string[]
  taskSkills?: string[]
  source_language_classifier_value_id?: string
  destination_language_classifier_value_id?: string
}

const GeneralPriceList: FC<GeneralPriceListProps> = ({
  selectedVendorsIds = [],
  taskSkills = [],
  source_language_classifier_value_id,
  destination_language_classifier_value_id,
}) => {
  const { t } = useTranslation()

  const prices2 = [
    {
      id: '1',
      vendor_id: '10',
      skill_id: '11',
      src_lang_classifier_value_id: 'fdf',
      dst_lang_classifier_value_id: 'fdf',
      created_at: 'fdf',
      updated_at: 'fdf',
      character_fee: 0,
      word_fee: 0,
      page_fee: 0,
      minute_fee: 0,
      hour_fee: 0,
      minimal_fee: 0,
      source_language_classifier_value: {
        id: '22',
        type: 'type',
        value: 'est',
        name: 'name',
      },
      destination_language_classifier_value: {
        id: '23',
        type: 'type',
        value: 'rus',
        name: 'name',
      },
      vendor: {
        id: '33',
        institution_user: {
          id: '33',
          institution: {
            id: '88',
            name: 'institusion name',
          },
          roles: [],
          status: UserStatus.Active,
          user: {
            id: '123',
            personal_identification_code: '49211223399',
          },
        },
        company_name: 'company',
        prices: [],
        tags: [],
        skills: [{ id: '12', name: 'skill' }],
        comment: 'comment',
      },
    },
  ]

  const {
    prices,
    paginationData,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useAllPricesFetch()

  const [searchValue, setSearchValue] = useState<string>()

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debounce(handleFilterChange, 300)({ name: event.target.value })
      // TODO: not sure yet whether filtering param will be name
    },
    [handleFilterChange]
  )

  return (
    <>
      <div>
        <h1>{t('vendors.price_list')}</h1>
        <Root>
          <TextInput
            name={'search'}
            ariaLabel={t('label.search_by_name_here')}
            placeholder={t('label.search_by_name_here')}
            value={searchValue}
            onChange={handleSearchVendors}
            className={classes.searchInput}
            generalPriceListInput={classes.generalPriceListInput}
            isSearch
          />
        </Root>
      </div>
      <GeneralPriceListTable
        data={prices}
        {...{
          paginationData,
          isLoading,
          handleFilterChange,
          handleSortingChange,
          handlePaginationChange,
          selectedVendorsIds,
          taskSkills,
          source_language_classifier_value_id,
          destination_language_classifier_value_id,
        }}
      />
    </>
  )
}

export default GeneralPriceList
