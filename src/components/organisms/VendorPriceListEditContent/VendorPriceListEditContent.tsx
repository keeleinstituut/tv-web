import { FC } from 'react'
import { Control } from 'react-hook-form'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import { Root } from '@radix-ui/react-form'
import EditVendorPricesTable from 'components/organisms/tables/EditVendorPricesTable/EditVendorPricesTable'

type VendorPriceListEditContentProps = {
  control: Control<FormValues>
  srcLanguageValue?: string
  dstLanguageValues?: string[]
  languageDirectionKey: string
}

const VendorPriceListEditContent: FC<VendorPriceListEditContentProps> = ({
  control,
  srcLanguageValue,
  dstLanguageValues,
  languageDirectionKey,
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
          control={control}
          languageDirectionKey={languageDirectionKey}
        />
      </Root>
    </>
  )
}

export default VendorPriceListEditContent
