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
    values: defaultValues,
  })

  const formValues = useWatch({ control })

  console.log('formValues', formValues)

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

      const filteredTrueValuesChunks = pickBy(assignmentChunks, (value) => {
        const assignment: boolean = values(value as unknown)[0] as boolean
        return assignment === true
      })

      const payload = {
        linking: map(filteredTrueValuesChunks, (assignment, key) => {
          return {
            cat_tool_job_id: Object.keys(assignment)[0],
            assignment_id: key,
          }
        }),
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
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [assignments, linkCatToolJobs, t]
  )

  const resetForm = useCallback(() => {
    setIsEditable(false)
    reset(defaultValues)
  }, [reset, defaultValues])

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
              subOrderCatJob={cat_jobs}
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
