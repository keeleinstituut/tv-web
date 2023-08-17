import { FC, Fragment, useCallback, useState } from 'react'
import useValidators from 'hooks/useValidators'
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form'
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
import { Root } from '@radix-ui/react-form'
import TestingTable from 'components/organisms/tables/ExamplesTable/ExamplesTable'
import UsersTable from 'components/organisms/tables/UsersTable/UsersTable'
import { ReactComponent as ButtonArrow } from 'assets/icons/button_arrow.svg'
import ModalBase, {
  ModalSizeTypes,
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { DropdownSizeTypes } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import FileImport, {
  InputFileTypes,
} from 'components/organisms/FileImport/FileImport'
import {
  showNotification,
  NotificationPropsWithoutClose,
} from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import ModalRoot, {
  ModalTypes,
  showModal,
} from 'components/organisms/modals/ModalRoot'

const dummyNotifications: NotificationPropsWithoutClose[] = [
  {
    title: 'Test Success',
    content: 'Random success message here with some longer text',
    type: NotificationTypes.Success,
  },
  {
    title: 'Test Warning',
    content: 'Random warning message here with some longer text',
    type: NotificationTypes.Warning,
  },
  {
    title: 'Test Error',
    content: 'Random error message here with some longer text',
    type: NotificationTypes.Error,
  },
  {
    title: 'Test Info',
    content: 'Random info message here with some longer text',
    type: NotificationTypes.Info,
  },
]

type FormValues = {
  email?: string
  terms?: string
  name?: string
  datePicker?: string
  selections?: string
  multipleSelections?: string
  timePicker?: string
  timePickerSeconds?: string
  search?: string
  comment?: string
}

const Test: FC = () => {
  const { t } = useTranslation()
  const { emailValidator } = useValidators()

  const { control, handleSubmit } = useForm<FormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
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
    {
      inputType: InputTypes.Text,
      ariaLabel: 'Otsi',
      name: 'search',
      placeholder: 'Otsi...',
      isSearch: true,
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: 'Kommenteeri',
      label: 'Kommenteeri',
      name: 'comment',
      placeholder: 'Kirjuta siia',
      isTextarea: true,
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
      rules: {
        required: true,
      },
    },

    {
      inputType: InputTypes.Time,
      name: 'timePicker',
      label: 'time picker label',
      ariaLabel: 'time picker aria label',
      showSeconds: false,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Time,
      name: 'timePickerSeconds',
      label: 'time picker seconds label',
      ariaLabel: 'time picker seconds aria label',
      showSeconds: true,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Selections,
      name: 'selections',
      label: 'selections label',
      ariaLabel: 'selections aria label',
      options: [
        { label: 'Option1jhiruguehiue', value: 'Option 1' },
        { label: 'Option 2', value: 'Option 2' },
        { label: 'Option 3', value: 'Option 3' },
        { label: 'Option 4', value: 'Option 4' },
      ],
      placeholder: 'Choose option',
      multiple: false,
      hideTags: true,
      dropdownSize: DropdownSizeTypes.M,
      helperText:
        'Kui valid „Avalik“ või „Asutustega jagamiseks“, siis seda mälu jagatakse ka asutuseväliste kasutajatega.',
      rules: {
        required: true,
      },
      showSearch: true,
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
        { label: 'Option 5', value: 'Option 5' },
        { label: 'Option 6', value: 'Option 6' },
        { label: 'Option ieruhiruthr7', value: 'Option 7' },
        { label: 'Option 8985759867', value: 'Option 8' },
      ],
      placeholder: 'Choose options',
      multiple: true,
      buttons: true,
      rules: {
        required: true,
      },
    },
  ]

  const onSubmit: SubmitHandler<FormValues> = useCallback((values, e) => {
    console.log('on submit', values, e)
  }, [])

  const onError: SubmitErrorHandler<FormValues> = useCallback(
    (errors, e) => console.log('on error', errors, e),
    []
  )

  const testNotifications = () => {
    showNotification(dummyNotifications[0])
    setTimeout(showNotification, 2000, dummyNotifications[1])
    setTimeout(showNotification, 4000, dummyNotifications[2])
    setTimeout(showNotification, 6000, dummyNotifications[3])
  }
  const handleModalOpen = () => {
    showModal(ModalTypes.FormProgress, {
      formData: [
        {
          label: 'Vali keelepaarid',
          title: 'Teostajale keelepaaride valimine',
          helperText:
            'Valida saab ühe algkeele ja ühe või mitu sihtkeelt. Vlaides rohkem kui ühe sihtkeele tuleb arvestada, et valtud keeltele saad sisestada ühed ja samad hinnad. Kui soovid igale keelepaarile sisestada einevaid ühiku hinnad, siis tuleb iga keelepaar sisestada edaldi.',
          modalContent: (
            <div>
              <p>Algkeel</p>
              <p>SihtKeel</p>
            </div>
          ),
        },
        {
          label: 'Lisa oskused',
          title: 'Teostajale oskuste valimine',
          helperText:
            'Määra teostaja oskused, millele soovid ühikuhinnad lisada.',
          modalContent: (
            <div>
              <p>Algkeel</p>
              <p>SihtKeel</p>
            </div>
          ),
        },
        {
          label: 'Lisa hinnakiri',
          title: 'Keelepaaridele hinnakirja määramine',
          helperText:
            'Määra oskusele ühikupõhised hinnad. Juhul, kui mõnda arvestusühikut selle teostaja puhul ei kasutata või puudub kokkulepitud hind, siis võib jätta selle ühiku hinnaks null',
          modalContent: (
            <div>
              <p>Algkeel</p>
              <p>SihtKeel</p>
            </div>
          ),
        },
      ],
    })
  }

  return (
    <>
      <div />
      <DynamicForm
        fields={testFields}
        control={control}
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <Button
          appearance={AppearanceTypes.Primary}
          children="bu"
          size={SizeTypes.M}
          icon={ButtonArrow}
          type="submit"
          ariaLabel={t('label.button_arrow')}
          iconPositioning={IconPositioningTypes.Right}
        />
      </DynamicForm>
      <BaseButton onClick={handleModalOpen}>{'Ava vorm'}</BaseButton>
      <ModalRoot />

      <Root>
        <TestingTable />
        <UsersTable />
      </Root>

      <ModalBase
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
            icon: ButtonArrow,
            iconPositioning: IconPositioningTypes.Left,
          },
          {
            appearance: AppearanceTypes.Secondary,
            onClick: handleClose,
            children: t('button.yes'),
            disabled: true,
            icon: ButtonArrow,
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
      </ModalBase>
      <FileImport
        helperText={'CSV lisamisel tuleb väljad eraldada semikooloniga.'}
        fileButtonText={t('button.add_csv')}
        fileButtonChangeText={t('button.add_new_csv')}
        inputFileTypes={[InputFileTypes.Csv]}
        allowMultiple
      />
      <Button
        appearance={AppearanceTypes.Primary}
        children="Test notifications"
        size={SizeTypes.M}
        icon={ButtonArrow}
        ariaLabel={t('label.button_arrow')}
        iconPositioning={IconPositioningTypes.Right}
        onClick={testNotifications}
      />
    </>
  )
}

export default Test
