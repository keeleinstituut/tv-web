import { getLocalDateOjectFromUtcDateString } from 'helpers'
import { map, uniq } from 'lodash'
import { DetailedOrder } from 'types/orders'

import dayjs from 'dayjs'

export const getOrderDefaultValues = ({
  institutionUserId,
  isNew,
  order,
}: {
  institutionUserId: string
  isNew: boolean
  order?: DetailedOrder
}) => {
  const {
    deadline_at,
    event_start_at,
    type_classifier_value,
    client_institution_user,
    manager_institution_user,
    reference_number = '',
    source_files,
    help_files,
    translation_domain_classifier_value,
    comments = '',
    ext_id = '',
    sub_projects,
    accepted_at = '',
    corrected_at = '',
    rejected_at = '',
    cancelled_at = '',
    created_at = '',
    tags = [],
  } = order || {}
  const source_language_classifier_value_id =
    sub_projects?.[0]?.source_language_classifier_value_id || ''
  const destination_language_classifier_value_ids =
    uniq(map(sub_projects, 'destination_language_classifier_value_id')) || []

  const help_file_types = map(
    help_files,
    ({ custom_properties }) => custom_properties?.type
  )

  return {
    type_classifier_value_id: type_classifier_value?.id,
    client_institution_user_id: isNew
      ? institutionUserId
      : client_institution_user?.id,
    manager_institution_user_id: manager_institution_user?.id,
    reference_number,
    source_files: isNew ? [] : source_files,
    help_files: isNew ? [] : help_files,
    ext_id,
    deadline_at: deadline_at
      ? getLocalDateOjectFromUtcDateString(deadline_at)
      : { date: '', time: '' },
    event_start_at: event_start_at
      ? getLocalDateOjectFromUtcDateString(event_start_at)
      : { date: '', time: '' },
    source_language_classifier_value_id,
    destination_language_classifier_value_ids,
    help_file_types,
    translation_domain_classifier_value_id:
      translation_domain_classifier_value?.id,
    comments,
    tags: map(tags, 'id'),
    accepted_at: accepted_at ? dayjs(accepted_at).format('DD.MM.YYYY') : '',
    corrected_at: corrected_at ? dayjs(corrected_at).format('DD.MM.YYYY') : '',
    rejected_at: rejected_at ? dayjs(rejected_at).format('DD.MM.YYYY') : '',
    cancelled_at: cancelled_at ? dayjs(cancelled_at).format('DD.MM.YYYY') : '',
    created_at: created_at ? dayjs(created_at).format('DD.MM.YYYY') : '',
  }
}
