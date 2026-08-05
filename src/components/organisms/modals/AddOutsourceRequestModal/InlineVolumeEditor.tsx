import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import classNames from 'classnames'

import Delete from 'assets/icons/delete.svg?react'
import Edit from 'assets/icons/edit.svg?react'
import Add from 'assets/icons/add.svg?react'

import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import VolumeForm, { VolumeFormState } from 'components/organisms/forms/VolumeForm/VolumeForm'
import { useAssignmentCache } from 'hooks/requests/useAssignments'
import { useAssignmentRemoveVolume } from 'hooks/requests/useVolumes'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'
import { VolumeValue } from 'types/volumes'

import classes from './classes.module.scss'

interface InlineVolumeEditorProps {
  assignmentId: string
  sub_project_id: string
}

const noop = () => {}

const InlineVolumeEditor: FC<InlineVolumeEditorProps> = ({
  assignmentId,
  sub_project_id,
}) => {
  const { t } = useTranslation()

  const assignment = useAssignmentCache({ id: assignmentId, sub_project_id })
  const volumes = assignment?.volumes ?? []

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

  const openAdd = useCallback(() => {
    setIsAdding(true)
    setEditingVolumeId(null)
    setDeletingVolumeId(null)
  }, [])

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
          <VolumeForm
            assignmentId={assignmentId}
            sub_project_id={sub_project_id}
            hideVendor
            onFormStateChange={setAddFormState}
            onSuccess={() => setIsAdding(false)}
          />
          <div className={classes.inlineActionButtons}>
            <Button
              appearance={AppearanceTypes.Primary}
              onClick={addFormState.submit}
              loading={addFormState.isLoading}
              disabled={!addFormState.isValid || addFormState.isLoading}
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
