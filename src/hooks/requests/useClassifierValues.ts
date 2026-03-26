import { apiClient } from 'api'
import { useQuery } from '@tanstack/react-query'
import { map } from 'lodash'
import { endpoints } from 'api/endpoints'
import {
  ClassifierValuesPayload,
  ClassifierValuesDataTypes,
  ClassifierValue,
} from 'types/classifierValues'

export const useClassifierValuesFetch = (
  initialFilters?: ClassifierValuesPayload,
  orderFn?: (values: ClassifierValue[]) => ClassifierValue[]
) => {
  const {
    isLoading,
    isError,
    data: classifierValuesData,
  } = useQuery<ClassifierValuesDataTypes>({
    queryKey: ['classifierValues', initialFilters],
    enabled: !!initialFilters,
    queryFn: () => apiClient.get(endpoints.CLASSIFIER_VALUES, initialFilters),
  })

  let { data: classifierValues } = classifierValuesData || {}

  if (orderFn && classifierValues) {
    classifierValues = orderFn(classifierValues)
  }

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
