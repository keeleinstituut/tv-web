import { FC, useCallback } from 'react'
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import DatePickerInput from 'components/molecules/DatePickerInput/DatePickerInput'
import { useTranslation } from 'react-i18next'
import DynamicForm, {
  FieldProps,
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'

export interface DeactivateUserModalProps {
  title?: string
  cancelButtonContent?: string
  proceedButtonContent?: string
  modalContent?: string
  isModalOpen?: boolean
  closeModal: () => void
  handleProceed?: () => void
  className?: string
}

interface FormValues {
  deactivation_date: string
}

const DeactivateUserModal: FC<DeactivateUserModalProps> = ({
  title,
  cancelButtonContent,
  proceedButtonContent,
  modalContent,
  isModalOpen,
  closeModal,
  handleProceed,
  className,
}) => {
  const { t } = useTranslation()

  const calculateOneYearFromCurrentDate = () => {
    const currentDate = new Date()
    const nextYear = new Date(
      currentDate.getFullYear() + 1,
      currentDate.getMonth(),
      currentDate.getDate()
    )

    const newDate = nextYear.toDateString()

    console.log('newDate', newDate)

    return nextYear.toDateString()
  }

  calculateOneYearFromCurrentDate()

  // const fields: FieldProps<FormValues>[] = {
  //   inputType: InputTypes.Date,
  //   // ariaLabel: t(`privileges.${key}`),
  //   // label: t(`privileges.${key}`),
  //   // name: `privileges.${key}`,
  //   // disabled: !includes(userPrivileges, Privileges.EditRole),
  //   // onClick: is_root ? handleMainUserPrivilegeClick : undefined,
  // }

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      className={className}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: cancelButtonContent,
          size: SizeTypes.M,
          onClick: closeModal,
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: () => {
            if (handleProceed) {
              handleProceed()
            }
            closeModal()
          },
          children: proceedButtonContent,
        },
      ]}
    >
      {/* <DatePickerInput
        name={t('label.user_deactivation_date')}
        ariaLabel={t('label.user_deactivation_date')}
        label={t('label.user_deactivation_date')}
        onChange={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
      /> */}

      {/* <DynamicForm
        fields={fields}
        // control={control}
        // onSubmit={handleSubmit(onSubmit)}
        // className={classes.formContainer}
      ></DynamicForm> */}
    </ModalBase>
  )
}

export default DeactivateUserModal
