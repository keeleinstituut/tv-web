import { FC } from 'react'
import { Control } from 'react-hook-form'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import { Root } from '@radix-ui/react-form'
import VendorPricesTable from 'components/organisms/tables/VendorPricesTable/VendorPricesTable'

type VendorPriceListEditContentProps = {
  control: Control<FormValues>
  srcLanguageValue?: string
  dstLanguageValues?: string[]
  languageDirectionKey: string
  languageOptions?: { value: string; label: string }[]
}

const VendorPriceListEditContent: FC<VendorPriceListEditContentProps> = ({
  control,
  srcLanguageValue,
  dstLanguageValues,
  languageDirectionKey,
  languageOptions,
}) => {
  return (
    <>
      <LanguageLabels
        control={control}
        srcLanguageValue={srcLanguageValue}
        dstLanguageValues={dstLanguageValues}
        languageOptions={languageOptions}
      />
      <Root>
        <VendorPricesTable
          control={control}
          languageDirectionKey={languageDirectionKey}
        />
      </Root>
    </>
  )
}

export default VendorPriceListEditContent
