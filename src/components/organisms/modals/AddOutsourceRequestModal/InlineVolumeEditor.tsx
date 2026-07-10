import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { find, isEmpty, map } from 'lodash'
import classNames from 'classnames'

import Delete from 'assets/icons/delete.svg?react'
import Edit from 'assets/icons/edit.svg?react'
import Add from 'assets/icons/add.svg?react'

import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import SelectionControlsInput from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import VolumeForm, { VolumeFormState } from 'components/organisms/forms/VolumeForm/VolumeForm'
import { useSubProjectCache } from 'hooks/requests/useProjects'
import { useAssignmentCache } from 'hooks/requests/useAssignments'
import { useCatAnalysisFetch } from 'hooks/requests/useAnalysis'
import { useAssignmentRemoveVolume } from 'hooks/requests/useVolumes'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'
import { VolumeValue } from 'types/volumes'
import { useForm } from 'react-hook-form'
import { useMemo } from 'react'

import classes from './classes.module.scss'

interface InlineVolumeEditorProps {
  assignmentId: string
  sub_project_id: string
}

interface CatJobFormValues {
  addType: 'manual' | 'cat'
  chunkId?: string
}

const noop = () => {}

const InlineVolumeEditor: FC<InlineVolumeEditorProps> = ({
  assignmentId,
  sub_project_id,
}) => {
  const { t } = useTranslation()

  const assignment = useAssignmentCache({ id: assignmentId, sub_project_id })
  const volumes = assignment?.volumes ?? []

  const { cat_features } = useSubProjectCache(sub_project_id) || {}
  const catSupported = !isEmpty(cat_features)
  const { cat_analysis } = useCatAnalysisFetch({
    subProjectId: catSupported ? sub_project_id : undefined,
  })

  const { removeAssignmentVolume, isLoading: isDeleting } =
    useAssignmentRemoveVolume({ subProjectId: sub_project_id })

  // Add flow
  const [isAdding, setIsAdding] = useState(false)
  const [addFormState, setAddFormState] = useState<VolumeFormState>({
    submit: noop,
    isValid: false,
    isLoading: false,
  })

  // Per-row edit / delete
  const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null)
  const [editFormState, setEditFormState] = useState<VolumeFormState>({
    submit: noop,
    isValid: false,
    isLoading: false,
  })
  const [deletingVolumeId, setDeletingVolumeId] = useState<string | null>(null)

  // CAT job selection within the add flow
  const {
    control: catControl,
    watch: catWatch,
    reset: catReset,
  } = useForm<CatJobFormValues>({
    defaultValues: { addType: 'manual' },
  })
  const pendingAddType = catWatch('addType')
  const pendingCatJobId = catWatch('chunkId')

  const openAdd = useCallback(() => {
    setIsAdding(true)
    setEditingVolumeId(null)
    setDeletingVolumeId(null)
    catReset({ addType: 'manual' })
  }, [catReset])

  const openEdit = useCallback((volumeId: string) => {
    setEditingVolumeId(volumeId)
    setIsAdding(false)
    setDeletingVolumeId(null)
  }, [])

  const openDelete = useCallback((volumeId: string) => {
    setDeletingVolumeId(volumeId)
    setIsAdding(false)
    setEditingVolumeId(null)
  }, [])

  const cancelAll = useCallback(() => {
    setIsAdding(false)
    setEditingVolumeId(null)
    setDeletingVolumeId(null)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deletingVolumeId) return
    await removeAssignmentVolume({ volumeId: deletingVolumeId })
    setDeletingVolumeId(null)
  }, [deletingVolumeId, removeAssignmentVolume])

  const addTypeOptions = useMemo(
    () => [
      { value: 'manual', label: t('task.add_manual_volume') },
      ...(catSupported
        ? [{ value: 'cat', label: t('task.add_cat_volume') }]
        : []),
    ],
    [catSupported, t]
  )

  const catJobOptions = useMemo(
    () =>
      map(cat_analysis?.cat_jobs, ({ id, name }) => ({
        value: id.toString(),
        label: name,
      })),
    [cat_analysis?.cat_jobs]
  )

  const catChunkField: FieldProps<CatJobFormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.RadioGroup,
        name: 'chunkId',
        options: catJobOptions,
        rules: { required: true },
      },
    ],
    [catJobOptions]
  )

  const selectedCatJob =
    pendingCatJobId && cat_analysis?.cat_jobs
      ? find(cat_analysis.cat_jobs, { id: pendingCatJobId })
      : undefined

  const isAddFormReady =
    pendingAddType === 'manual' || (pendingAddType === 'cat' && !!pendingCatJobId)

  return (
    <div className={classes.inlineVolumeEditor}>
      {map(volumes, (volume: VolumeValue) => {
        if (deletingVolumeId === volume.id) {
          return (
            <div key={volume.id} className={classes.inlineConfirmRow}>
              <span className={classes.inlineConfirmText}>
                {t('modal.confirm_delete_volume')}
              </span>
              <div className={classes.inlineActionButtons}>
                <Button
                  appearance={AppearanceTypes.Primary}
                  onClick={handleDelete}
                  loading={isDeleting}
                  disabled={isDeleting}
                >
                  {t('button.delete')}
                </Button>
                <Button
                  appearance={AppearanceTypes.Secondary}
                  onClick={cancelAll}
                  disabled={isDeleting}
                >
                  {t('button.cancel')}
                </Button>
              </div>
            </div>
          )
        }

        if (editingVolumeId === volume.id) {
          return (
            <div key={volume.id} className={classes.inlineFormRow}>
              <VolumeForm
                assignmentId={assignmentId}
                id={volume.id}
                isCat={!!volume.cat_job}
                unit_fee={volume.unit_fee}
                unit_type={volume.unit_type}
                unit_quantity={Number(volume.unit_quantity)}
                sub_project_id={sub_project_id}
                hideVendor
                onFormStateChange={setEditFormState}
                onSuccess={() => setEditingVolumeId(null)}
              />
              <div className={classes.inlineActionButtons}>
                <Button
                  appearance={AppearanceTypes.Primary}
                  onClick={editFormState.submit}
                  loading={editFormState.isLoading}
                  disabled={!editFormState.isValid || editFormState.isLoading}
                >
                  {t('button.save')}
                </Button>
                <Button
                  appearance={AppearanceTypes.Secondary}
                  onClick={cancelAll}
                  disabled={editFormState.isLoading}
                >
                  {t('button.cancel')}
                </Button>
              </div>
            </div>
          )
        }

        return (
          <div key={volume.id} className={classes.inlineVolumeRow}>
            <span>
              {`${Number(volume.unit_quantity)} ${t(
                `label.${apiTypeToKey(volume.unit_type)}`
              )}${volume.cat_job ? ` ${t('task.open_in_cat')}` : ''}`}
            </span>
            <BaseButton
              onClick={() => openEdit(volume.id)}
              className={classes.inlineEditButton}
              aria-label={t('button.edit')}
            >
              <Edit />
            </BaseButton>
            <BaseButton
              onClick={() => openDelete(volume.id)}
              className={classes.inlineDeleteButton}
              aria-label={t('button.delete')}
            >
              <Delete />
            </BaseButton>
          </div>
        )
      })}

      {isAdding && (
        <div className={classes.inlineFormRow}>
          {catSupported && (
            <SelectionControlsInput
              name="addType"
              ariaLabel={t('modal.pick_volume_add_method')}
              value={pendingAddType}
              options={addTypeOptions}
              onChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v
                catReset({ addType: (val as 'manual' | 'cat') ?? 'manual' })
              }}
            />
          )}
          {pendingAddType === 'cat' && catJobOptions.length > 0 && (
            <DynamicForm
              control={catControl}
              fields={catChunkField}
            />
          )}
          {isAddFormReady && (
            <VolumeForm
              assignmentId={assignmentId}
              isCat={pendingAddType === 'cat'}
              catJobId={pendingCatJobId ?? undefined}
              volume_analysis={selectedCatJob?.volume_analysis}
              sub_project_id={sub_project_id}
              hideVendor
              onFormStateChange={setAddFormState}
              onSuccess={() => {
                setIsAdding(false)
                catReset({ addType: 'manual' })
              }}
            />
          )}
          <div className={classes.inlineActionButtons}>
            <Button
              appearance={AppearanceTypes.Primary}
              onClick={addFormState.submit}
              loading={addFormState.isLoading}
              disabled={
                !isAddFormReady ||
                !addFormState.isValid ||
                addFormState.isLoading
              }
            >
              {t('button.save')}
            </Button>
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={cancelAll}
              disabled={addFormState.isLoading}
            >
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      )}

      <Button
        appearance={AppearanceTypes.Text}
        iconPositioning={IconPositioningTypes.Left}
        icon={Add}
        onClick={openAdd}
        className={classNames(classes.addVolumeButton)}
      >
        {t('button.add_volume')}
      </Button>
    </div>
  )
}

export default InlineVolumeEditor
