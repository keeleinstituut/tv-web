import { apiClient } from 'api'
import { useQuery } from '@tanstack/react-query'
import { map } from 'lodash'
import { endpoints } from 'api/endpoints'
import {
  ClassifierValuesPayload,
  ClassifierValuesDataTypes,
} from 'types/classifierValues'

export const useClassifierValuesFetch = (
  initialFilters?: ClassifierValuesPayload
) => {
  const {
    isLoading,
    isError,
    data: classifierValuesData,
  } = useQuery<ClassifierValuesDataTypes>({
    queryKey: ['classifierValues'],
    queryFn: () => apiClient.get(endpoints.CLASSIFIER_VALUES),
  })

  const { data: classifierValues } = classifierValuesData || {}

  const classifierValuesFilters = map(classifierValues, ({ id, name }) => {
    return { value: id, label: name }
  })

  return {
    classifierValues,
    isLoading: isLoading,
    isError: isError,
    classifierValuesFilters,
  }
}
