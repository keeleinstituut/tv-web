import Loader from 'components/atoms/Loader/Loader'
import { FC, useCallback, useEffect, useState } from 'react'
import { includes, toLower } from 'lodash'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import classNames from 'classnames'
import useHashState from 'hooks/useHashState'
import OrderStatusTag from 'components/molecules/OrderStatusTag/OrderStatusTag'
import { LeftComponent } from 'components/templates/SubOrderSection/SubOrderSection'
import TaskContent from 'components/organisms/TaskContent/TaskContent'
import Button from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'

import classes from './classes.module.scss'
import { DetailedOrder, SourceFile } from 'types/orders'
import { LanguageClassifierValue } from 'types/classifierValues'

interface TaskProps {
  ext_id?: string
  isLoading: boolean
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
  project?: DetailedOrder
  cat_files?: SourceFile[]
  id?: string
}

const Task: FC<TaskProps> = ({
  ext_id = '',
  isLoading,
  source_language_classifier_value,
  destination_language_classifier_value,
  project,
  id,
  cat_files,
}) => {
  const { t } = useTranslation()
  const { setHash, currentHash } = useHashState()
  const [isExpanded, setIsExpanded] = useState(includes(currentHash, ext_id))

  const { price, deadline_at, status } = project || {}

  const languageDirection = `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`

  const attemptScroll = useCallback(() => {
    const matchingElement = document.getElementById(ext_id)
    if (matchingElement && !isLoading) {
      matchingElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else if (matchingElement && isLoading) setTimeout(attemptScroll, 300)
  }, [ext_id, isLoading])

  useEffect(() => {
    if (currentHash && includes(currentHash, ext_id)) {
      attemptScroll()
      if (!isExpanded) {
        setIsExpanded(true)
      }
    }
  }, [currentHash, ext_id, attemptScroll, isExpanded])

  const handleOpenContainer = useCallback(
    (isExpanded: boolean) => {
      setHash(isExpanded ? ext_id : '')
      setIsExpanded(isExpanded)
    },
    [ext_id, setHash]
  )

  const handleOpenCompleteModal = useCallback(() => {
    showModal(ModalTypes.ConfirmationModal, {
      title: t('modal.confirm_complete_task'),
      modalContent: t('modal.confirm_complete_task_details'),
      cancelButtonContent: t('button.quit'),
      proceedButtonContent: t('button.complete'),
      className: classes.completeModal,
      // TODO: handle proceed
    })
  }, [t])

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <ExpandableContentContainer
      className={classNames(
        classes.expandableContainer,
        status && classes[toLower(status)]
      )}
      onExpandedChange={handleOpenContainer}
      id={ext_id}
      isExpanded={isExpanded}
      rightComponent={<OrderStatusTag status={status} />}
      wrapContent
      leftComponent={
        <LeftComponent
          {...{ ext_id, deadline_at, price, languageDirection }}
          isTaskView
        />
      }
    >
      <TaskContent
        deadline_at={deadline_at}
        source_files={[]}
        cat_files={cat_files}
        cat_jobs={[]}
        cat_analyzis={[]}
        final_files={[]}
        id={id}
        source_language_classifier_value={source_language_classifier_value}
        destination_language_classifier_value={
          destination_language_classifier_value
        }
        event_start_at={project?.event_start_at}
      />
      <Button
        className={classes.finishedButton}
        onClick={handleOpenCompleteModal}
      >
        {t('button.mark_as_finished')}
      </Button>
    </ExpandableContentContainer>
  )
}

export default Task
