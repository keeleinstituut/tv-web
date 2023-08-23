import { FC } from 'react'
import { Control, useWatch } from 'react-hook-form'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import { Root } from '@radix-ui/react-form'
import AddVendorPricesTable from 'components/organisms/tables/AddVendorPricesTable/AddVendorPricesTable'

export type VendorPriceListThirdStepProps = {
  control: Control<FormValues>
  languageOptions?: { label: string; value: string }[]
}

const VendorPriceListThirdStep: FC<VendorPriceListThirdStepProps> = ({
  control,
  languageOptions,
}) => {
  const selectedSkills = useWatch({ control, name: 'skill_id' })

  return (
    <>
      <LanguageLabels control={control} languageOptions={languageOptions} />
      <Root>
        <AddVendorPricesTable
          selectedSkills={selectedSkills}
          control={control}
        />
      </Root>
    </>
  )
}

export default VendorPriceListThirdStep
