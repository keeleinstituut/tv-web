import { Control, FieldValues, UseFormGetValues } from 'react-hook-form'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import { Root } from '@radix-ui/react-form'
import VendorPricesTable from 'components/organisms/tables/VendorPricesTable/VendorPricesTable'

type VendorPriceListEditContentProps<TFormValues extends FieldValues> = {
  control: Control<TFormValues>
  srcLanguageValue?: string
  dstLanguageValues?: string[]
  languageDirectionKey: string
  languageOptions?: { value: string; label: string }[]
  skillId?: string
  getValues: UseFormGetValues<TFormValues>
}

function VendorPriceListEditContent<TFormValues extends FieldValues>({
  control,
  srcLanguageValue,
  dstLanguageValues,
  languageDirectionKey,
  languageOptions,
  skillId,
  getValues,
}: VendorPriceListEditContentProps<TFormValues>) {
  return (
    <>
      <LanguageLabels<TFormValues>
        control={control}
        srcLanguageValue={srcLanguageValue}
        dstLanguageValues={dstLanguageValues}
        languageOptions={languageOptions}
      />
      <Root>
        <VendorPricesTable<TFormValues>
          control={control}
          languageDirectionKey={languageDirectionKey}
          skillId={skillId}
          getValues={getValues}
        />
      </Root>
    </>
  )
}

export default VendorPriceListEditContent
