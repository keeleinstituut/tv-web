import { FC, useCallback } from 'react'
import classNames from 'classnames'
import ToggleTabs, {
  ToggleTabsProps,
} from 'components/molecules/ToggleTabs/ToggleTabs'
import { useTranslation } from 'react-i18next'
import ToggleInput from 'components/molecules/ToggleInput/ToggleInput'
import { ReactComponent as Add } from 'assets/icons/add.svg'

import classes from './classes.module.scss'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from '../NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useToggleMtEngine } from 'hooks/requests/useOrders'

export enum FeatureTabs {
  Vendors = 'vendor',
  Xliff = 'xliff',
}

interface ToggleButtonsSectionProps {
  className?: string
  hidden?: boolean
  machineTranslation?: boolean
  setMachineTranslation: (newMachineTranslation: boolean) => void
}

const ToggleButtonsSection: FC<ToggleButtonsSectionProps> = ({
  className,
  hidden,
  machineTranslation,
  setMachineTranslation,
}) => {
  const { t } = useTranslation()

  if (hidden) return null
  return (
    <div className={classNames(classes.toggleButtonSection, className)}>
      <ToggleInput
        label={t('label.translation_tool')}
        name="translationTool"
        disabled
        value
      />
      <ToggleInput
        label={t('label.machine_translation')}
        onChange={setMachineTranslation}
        name="machineTranslation"
        value={machineTranslation}
        // TODO: not sure where the selected memory will come from yet
        tooltipContent={t('tooltip.selected_translation_memory', {
          memory: 'MTee',
        })}
      />
    </div>
  )
}

interface FeatureHeaderSectionProps extends ToggleTabsProps {
  catSupported?: boolean
  addVendor?: () => void
  mt_enabled?: boolean
  id?: string
}

const FeatureHeaderSection: FC<FeatureHeaderSectionProps> = ({
  setActiveTab,
  activeTab,
  catSupported,
  tabs,
  addVendor,
  mt_enabled = true,
  id,
}) => {
  const { t } = useTranslation()
  // TODO: not sure yet what this will do
  // It should decide whether machine translation is allowed or not, but not sure what that changes in other views

  const { toggleMtEngine } = useToggleMtEngine({ id: id })

  // TODO: not sure what this check will be yet
  // First part will be "Task data entry template variable "PM task entry": "false"" - Not sure what this will look like from BE yet
  // Second part will be: !!addVendor. We won't pass this function, when dealing with job_revision, which is not the first task (first after general info)
  const isSplittingAllowed = !!addVendor

  const toggleInputChange = useCallback(async () => {
    const payload = { mt_enabled: !mt_enabled }

    try {
      await toggleMtEngine(payload)

      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.machine_translation'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [mt_enabled, t, toggleMtEngine])

  return (
    <div
      className={classNames(
        classes.sectionHeader,
        activeTab === FeatureTabs.Xliff && classes.noBorder,
        !catSupported && !isSplittingAllowed && classes.hidden
      )}
    >
      <ToggleTabs
        {...{
          activeTab,
          setActiveTab,
          tabs,
          className: classes.featureTabs,
          hidden: !catSupported,
        }}
      />
      <ToggleButtonsSection
        className={classes.toggleButtons}
        hidden={activeTab === FeatureTabs.Xliff || !catSupported}
        machineTranslation={mt_enabled}
        setMachineTranslation={toggleInputChange}
      />
      <Button
        appearance={AppearanceTypes.Text}
        className={classes.addButton}
        iconPositioning={IconPositioningTypes.Left}
        icon={Add}
        children={t('button.add_new_vendor')}
        onClick={addVendor}
        hidden={activeTab === FeatureTabs.Xliff || !isSplittingAllowed}
      />
    </div>
  )
}

export default FeatureHeaderSection
