import { FC } from 'react'
import { Control } from 'react-hook-form'
import {
  FormValues,
  PriceObject,
} from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import { Root } from '@radix-ui/react-form'
import EditVendorPricesTable from 'components/organisms/tables/EditVendorPricesTable/EditVendorPricesTable'

type VendorPriceListEditContentProps = {
  control: Control<FormValues>
  editableSkills: PriceObject[]
  srcLanguageValue?: string
  dstLanguageValues?: string[]
}

const VendorPriceListEditContent: FC<VendorPriceListEditContentProps> = ({
  control,
  editableSkills,
  srcLanguageValue,
  dstLanguageValues,
}) => {
  return (
    <>
      <LanguageLabels
        control={control}
        srcLanguageValue={srcLanguageValue}
        dstLanguageValues={dstLanguageValues}
      />
      <Root>
        <EditVendorPricesTable
          editableSkills={editableSkills}
          control={control}
        />
      </Root>
    </>
  )
}

export default VendorPriceListEditContent
