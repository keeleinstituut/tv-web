import { FC, Fragment, useCallback, useState } from 'react'
import useValidators from 'hooks/useValidators'
import {
  useForm,
  SubmitHandler,
  SubmitErrorHandler,
  useWatch,
} from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ButtonArrowWhite } from 'assets/icons/button_arrow_white.svg'
import Modal, {
  ModalSizeTypes,
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/Modal/Modal'

type FormValues = {
  email?: string
  terms?: string
  datePicker?: string
  selections?: string
  multipleSelections?: string
}

const Test: FC = () => {
  const { t } = useTranslation()
  const { emailValidator } = useValidators()

  const { control, handleSubmit } = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  })

  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const testFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.email'),
      label: t('label.email'),
      name: 'email',
      placeholder: t('placeholder.email'),
      type: 'email',
      rules: {
        required: true,
        validate: emailValidator,
      },
    },
    { component: <h2>random</h2> },
    {
      inputType: InputTypes.Checkbox,
      name: 'terms',
      label: 'terms label',
      ariaLabel: 'aria label',
    },
    {
      inputType: InputTypes.Date,
      name: 'datePicker',
      label: 'date picker label',
      ariaLabel: 'date picker aria label',
      placeholder: 'pp.kk.aaaa',
    },
    {
      inputType: InputTypes.Selections,
      name: 'selections',
      label: 'selections label',
      ariaLabel: 'selections aria label',
      options: [
        { label: 'Option 1', value: 'Option 1' },
        { label: 'Option 2', value: 'Option 2' },
        { label: 'Option 3', value: 'Option 3' },
        { label: 'Option 4', value: 'Option 4' },
      ],
      defaultLabel: 'Select an option',
      multiple: false,
    },
    {
      inputType: InputTypes.Selections,
      name: 'multipleSelections',
      label: 'multipleSelections label',
      ariaLabel: 'multipleSelections aria label',
      options: [
        { label: 'Option 1', value: 'Option 1' },
        { label: 'Option 2', value: 'Option 2' },
        { label: 'Option 3', value: 'Option 3' },
        { label: 'Option 4', value: 'Option 4' },
      ],
      defaultLabel: 'Select multiple options',
      multiple: true,
    },
  ]

  const onSubmit: SubmitHandler<FormValues> = useCallback((values, e) => {
    console.log('on submit', values, e)
  }, [])

  const onError: SubmitErrorHandler<FormValues> = useCallback(
    (errors, e) => console.log('on error', errors, e),
    []
  )

  const formValue = useWatch({ control })

  console.log('formValue: ', formValue)
  return (
    <>
      <div />
      <DynamicForm
        fields={testFields}
        control={control}
        onSubmit={handleSubmit(onSubmit, onError)}
      />
      <Button
        appearance={AppearanceTypes.Primary}
        children="bu"
        size={SizeTypes.M}
        icon={ButtonArrowWhite}
        ariaLabel={t('label.button_arrow')}
        iconPositioning={IconPositioningTypes.Right}
      />

      <Modal
        title="Pealkiri"
        size={ModalSizeTypes.Narrow}
        buttonsPosition={ButtonPositionTypes.SpaceBetween}
        titleFont={TitleFontTypes.Gray}
        topButton={true}
        handleClose={handleClose}
        open={open}
        setOpen={setOpen}
        progressBar={<Fragment />}
        trigger={
          <Button appearance={AppearanceTypes.Text} onClick={handleOpen}>
            Kustuta konto
          </Button>
        }
        buttons={[
          {
            appearance: AppearanceTypes.Text,
            onClick: handleClose,
            children: t('button.cancel'),
            size: SizeTypes.M,
            ariaLabel: t('button.cancel'),
            href: 'http://localhost:3000/',
            icon: ButtonArrowWhite,
            iconPositioning: IconPositioningTypes.Left,
          },
          {
            appearance: AppearanceTypes.Secondary,
            onClick: handleClose,
            children: t('button.yes'),
            disabled: true,
            icon: ButtonArrowWhite,
          },
        ]}
      >
        <p>
          The standard Lorem Ipsum passage, used since the 1500s "Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
          velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
          occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum." Section 1.10.32 of "de Finibus Bonorum et
          Malorum", written by Cicero in 45 BC "Sed ut perspiciatis unde omnis
          iste natus error sit voluptatem accusantium doloremque laudantium,
          totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
          quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
          voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
          consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
          consectetur, adipisci velit, sed quia non numquam eius modi tempora
          incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut
          enim ad minima veniam, quis nostrum exercitationem ullam corporis
          suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Nemo
          enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
          sed quia consequuntur magni dolores eos qui ratione voluptatem sequi
          nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
          amet, consectetur, adipisci velit, sed quia non numquam eius modi
          tempora incidunt ut labore et dolore magnam aliquam quaerat
          voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem
          ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
          consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate
          velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum
          fugiat quo voluptas nulla pariatur?" 1914 translation by H. Rackham
          "But I must explain to you how all this mistaken idea of denouncing
          pleasure and praising pain was born and I will give you a complete
          account of the system, and expound the actual teachings of the great
          explorer of the truth, the master-builder of human happiness."
        </p>
      </Modal>
    </>
  )
}

export default Test
