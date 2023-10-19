import { FC, useCallback, useMemo, useState } from 'react'
import {
  map,
  reduce,
  includes,
  isEmpty,
  chunk,
  pickBy,
  values,
  filter,
} from 'lodash'
import { SubOrderDetail } from 'types/orders'
import FeatureCatJob from 'components/molecules/FeatureCatJob/FeatureCatJob'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useLinkCatToolJobs } from 'hooks/requests/useAssignments'

type FeatureCatJobsProps = Pick<SubOrderDetail, 'assignments' | 'cat_jobs'> & {
  hidden?: boolean
}

interface FormValues {
  [key: string]: string
}

const FeatureCatJobs: FC<FeatureCatJobsProps> = ({
  assignments,
  hidden,
  cat_jobs,
  ...rest
}) => {
  const { t } = useTranslation()
  const [isEditable, setIsEditable] = useState(false)

  const { linkCatToolJobs, isLoading } = useLinkCatToolJobs()

  // TODO: useForm and submit/edit buttons should be here
  // Value structure after this reduce will be:
  // {
  //   [assignment_id]: {
  //     [chunk_id]: true,
  //     ...
  //   },
  //   ...
  // }
  // TODO: we somehow need to get the new values in here as well
  const defaultValues = useMemo(
    () =>
      reduce(
        assignments,
        (result, { id, assigned_chunks }, index) => {
          if (!id) return result
          return {
            ...result,
            [id]: {
              ...reduce(
                cat_jobs,
                (result, { id }) => {
                  if (!id) return result
                  const isChunkSelected = assigned_chunks
                    ? includes(assigned_chunks, id)
                    : index === 0
                  return {
                    ...result,
                    [id]: isChunkSelected,
                  }
                },
                {}
              ),
            },
          }
        },
        {}
      ),
    [assignments, cat_jobs]
  )

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  console.log('useWatch({control})', useWatch({ control }))

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (assignmentChunks) => {
      // Current structure of assignmentChunks is following:
      // {
      //   [assignment_id]: {
      //     [chunk_id]: true,
      //     ...
      //   },
      //   ...
      // }
      // TODO: map these to whatever structure BE wants and send them

      console.log('assignmentChunks', assignmentChunks)

      const payload = {
        linking: [
          {
            cat_tool_job_id: '9a662210-912c-4f38-a54a-8656a983138e',
            assignment_id: '9a67988d-34be-4a93-aa34-6aea9f2dcb32',
          },
        ],
        feature: assignments[0].feature,
        sub_project_id: assignments[0].sub_project_id,
      }

      console.log('payload', payload)

      try {
        await linkCatToolJobs(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.files_assigned_to_vendors'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [t]
  )

  const resetForm = useCallback(() => {
    setIsEditable(false)
    reset(defaultValues)
  }, [reset, defaultValues])

  console.log('assignments', assignments)
  console.log('cat_jobs', cat_jobs)

  if (hidden) return null
  return (
    <>
      <div>
        {map([...assignments], (assignment, index) => {
          return (
            <FeatureCatJob
              key={assignment.id}
              index={index}
              control={control}
              cat_jobs={cat_jobs}
              isEditable={isEditable}
              {...assignment}
            />
          )
        })}
      </div>
      <div className={classes.formButtons}>
        <Button
          appearance={AppearanceTypes.Secondary}
          children={t('button.cancel')}
          onClick={resetForm}
          hidden={!isEditable || isEmpty(cat_jobs)}
          disabled={isSubmitting || isLoading}
        />
        <Button
          children={isEditable ? t('button.save') : t('button.change')}
          disabled={!isValid && isEditable}
          hidden={isEmpty(cat_jobs)}
          loading={isSubmitting || isLoading}
          onClick={
            isEditable ? handleSubmit(onSubmit) : () => setIsEditable(true)
          }
        />
      </div>
    </>
  )
}

export default FeatureCatJobs
