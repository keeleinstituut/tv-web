import { useAuth } from 'components/contexts/AuthContext'

// True only when the acting institution is a confirmed owner of the data.
// Unknown owner (id missing / still loading) => false (treated as non-owner),
// so restrictions default ON for safety. In practice the owner id is present at
// every call site, so this never hides controls from a real owner.
export const useIsDataOwner = (ownerInstitutionId?: string): boolean => {
  const { selectedInstitutionId } = useAuth()
  return !!ownerInstitutionId && selectedInstitutionId === ownerInstitutionId
}
