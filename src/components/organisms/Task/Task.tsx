import Loader from 'components/atoms/Loader/Loader'
import { useFetchSubOrder } from 'hooks/requests/useOrders'
import { FC, useCallback, useEffect, useState } from 'react'
import { includes, toLower } from 'lodash'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import classNames from 'classnames'
import useHashState from 'hooks/useHashState'
import OrderStatusTag from 'components/molecules/OrderStatusTag/OrderStatusTag'
import { LeftComponent } from 'components/templates/SubOrderSection/SubOrderSection'
import TaskContent from 'components/organisms/TaskContent/TaskContent'

import classes from './classes.module.scss'

const Task: FC<any> = ({ id, ext_id, status, deadline_at, price }) => {
  const { setHash, currentHash } = useHashState()
  const [isExpanded, setIsExpanded] = useState(includes(currentHash, ext_id))

  const { subOrder, isLoading } = useFetchSubOrder({ id })

  const languageDirection = `${subOrder?.source_language_classifier_value.value} > ${subOrder?.destination_language_classifier_value.value}`

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
          myTask
        />
      }
    >
      <TaskContent
        deadline_at={deadline_at}
        source_files={[]}
        cat_files={[]}
        cat_jobs={[]}
        cat_analyzis={[]}
        final_files={[]}
        subOrderId={''}
        source_language_classifier_value={
          subOrder?.source_language_classifier_value.value
        }
        destination_language_classifier_value={
          subOrder?.destination_language_classifier_value.value
        }
      />
    </ExpandableContentContainer>
  )
}

export default Task
