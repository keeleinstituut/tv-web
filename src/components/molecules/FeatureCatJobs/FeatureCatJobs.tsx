import { FC, useCallback, useMemo, useState } from 'react'
import { map, reduce, isEmpty, flatMap } from 'lodash'
import { CatJob, SubOrderDetail } from 'types/orders'
import FeatureCatJob from 'components/molecules/FeatureCatJob/FeatureCatJob'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useLinkCatToolJobs } from 'hooks/requests/useAssignments'

import classes from './classes.module.scss'

type FeatureCatJobsProps = Pick<SubOrderDetail, 'assignments'> & {
  hidden?: boolean
  subOrderCatJobs: CatJob[]
}
interface FormValues {
  [key: string]: string
}

const FeatureCatJobs: FC<FeatureCatJobsProps> = ({
  assignments,
  hidden,
  subOrderCatJobs,
  ...rest
}) => {
  const { t } = useTranslation()
  const [isEditable, setIsEditable] = useState(false)

  const { linkCatToolJobs, isLoading } = useLinkCatToolJobs()

  const defaultValues = useMemo(
    () =>
      reduce(
        assignments,
        (result, { id, cat_jobs }, index) => {
          if (!id) return result
          const catJobs = isEmpty(cat_jobs) ? subOrderCatJobs : cat_jobs

          return {
            ...result,
            [id]: {
              ...reduce(
                catJobs,
                (result, { id }) => {
                  if (!id) return result
                  const isChunkSelected = index === 0 || !isEmpty(cat_jobs)

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
    [assignments, subOrderCatJobs]
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

  const resetForm = useCallback(() => {
    setIsEditable(false)
    reset(defaultValues)
  }, [reset, defaultValues])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (assignmentChunks) => {
      const linking: {
        cat_tool_job_id: string
        assignment_id: string
      }[] = flatMap(
        Object.entries(assignmentChunks),
        ([assignment_id, catToolJob]) =>
          flatMap(Object.entries(catToolJob), ([cat_tool_job_id, value]) => {
            if (value) {
              return {
                cat_tool_job_id,
                assignment_id,
              }
            }
            return []
          })
      )

      const payload = {
        linking: linking,
        job_key: assignments[0].job_definition.job_key,
        sub_project_id: assignments[0].sub_project_id,
      }

      try {
        await linkCatToolJobs(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.files_assigned_to_vendors'),
        })
        setIsEditable(false)
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [assignments, linkCatToolJobs, t]
  )

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
              subOrderCatJobs={subOrderCatJobs}
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
          hidden={!isEditable || isEmpty(subOrderCatJobs)}
          disabled={isSubmitting || isLoading}
        />
        <Button
          children={isEditable ? t('button.save') : t('button.change')}
          disabled={!isValid && isEditable}
          hidden={isEmpty(subOrderCatJobs)}
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
