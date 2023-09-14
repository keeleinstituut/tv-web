import { useMutation } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { AssignmentPayload } from 'types/assignments'

// TODO: not sure what endpoint to use and what data structure to use
export const useAssignmentUpdate = ({ id }: { id?: string }) => {
  // const queryClient = useQueryClient()
  const { mutateAsync: updateAssignment, isLoading } = useMutation({
    mutationKey: ['assignments', id],
    mutationFn: (payload: AssignmentPayload) =>
      apiClient.put(`${endpoints.TASKS}/${id}`, payload),
    // TODO: might need to modify the assignment under subOrder: { assignments } in onSuccess
    // onSuccess: ({ data }) => {
    //   queryClient.setQueryData(
    //     ['institutions', id],
    //     // TODO: possibly will start storing all arrays as objects
    //     // if we do, then this should be rewritten
    //     (oldData?: InstitutionsDataType) => {
    //       const { data: previousData } = oldData || {}
    //       if (!previousData) return oldData
    //       const newData = { ...previousData, ...data }
    //       return { data: newData }
    //     }
    //   )
    //   queryClient.refetchQueries({ queryKey: ['institutions'], type: 'active' })
    // },
  })

  return {
    updateAssignment,
    isLoading,
  }
}
