import dayjs from 'dayjs'
import {
  omit,
  map,
  split,
  trim,
  reduce,
  values,
  join,
  compact,
  replace,
  includes,
  pickBy,
  keys,
  flatMap,
  uniqBy,
} from 'lodash'
import { FullRouteObject } from 'router/router'
import { PrivilegeKey, PrivilegeType, Privileges } from 'types/privileges'

import utc from 'dayjs/plugin/utc'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(advancedFormat)
dayjs.extend(timezone)

// TODO: split these into separate helper files, if we have too many
interface ObjectWithChildren {
  children?: object[]
}

interface CsvObjectStructure<ValuesType> {
  [key: string]: ValuesType
}
interface DownloadFileProps {
  data: BlobPart
  fileName: string
  fileType: string
}

export const usersCsvFieldsToKeys = {
  Isikukood: 'personal_identification_code',
  Nimi: 'name',
  Meiliaadress: 'email',
  Telefoninumber: 'phone',
  Üksus: 'department',
  Roll: 'role',
}

export const deepOmit = <
  InputType extends ObjectWithChildren,
  OutputType extends ObjectWithChildren
>(
  object: InputType,
  keysToOmit: string[]
): OutputType => {
  if (!object.children) {
    return omit(object, keysToOmit) as unknown as OutputType
  }
  return {
    ...(omit(object, keysToOmit) as unknown as OutputType),
    children: map(object.children, (child) => deepOmit(child, keysToOmit)),
  }
}

export const convertUsersCsvToArray = (csvData: string | ArrayBuffer) => {
  if (csvData && typeof csvData === 'string') {
    const rows = compact(split(csvData, '\n'))
    const [keys, ...values] = map(rows, trim)
    const keysArray = split(keys, ';') as Array<
      keyof typeof usersCsvFieldsToKeys
    >
    const arrayOfObjects = map(values, (value) => {
      const valuesArray = split(value, ';')
      const pattern = /("")(?!")|"/g

      return reduce(
        valuesArray,
        (result, value, index) => {
          if (!index && index !== 0) {
            return result
          }
          const formattedValue = value.replace(pattern, '')
          const key = usersCsvFieldsToKeys[keysArray[index]]
          const displayValue =
            key === usersCsvFieldsToKeys.Roll
              ? map(split(formattedValue, ','), trim)
              : formattedValue
          return {
            ...result,
            [key]: displayValue,
          }
        },
        {}
      )
    })
    return arrayOfObjects
  }
  return []
}

export const objectsToCsvFile = <ValuesType>(
  data: CsvObjectStructure<ValuesType>,
  headings: string[]
) => {
  const csvValues = values(data)
  const firstRow = join(headings, ';')
  const otherRows = map(csvValues, (rowObject) => join(values(rowObject), ';'))
  const csvString = `${firstRow}\r\n${join(otherRows, '\r\n')}`
  const blob = new Blob([csvString], { type: 'text/csv' })
  const file = new File([blob], 'users.csv', { type: 'text/csv' })
  return file
}

export const downloadFile = ({
  data,
  fileName,
  fileType,
}: DownloadFileProps) => {
  const blob = new Blob([data], { type: fileType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export const getPathWithPrivileges = ({
  path,
  privileges,
  parentPath,
  children,
}: {
  path?: string
  privileges?: Privileges[]
  parentPath?: string
  children?: FullRouteObject[]
}): object => {
  // if parentPath is not an empty string, we need the /
  // otherwise there is no need
  const parentPathString = parentPath ? `${parentPath}/` : ''
  // If path is empty string, then we use parent path
  // otherwise we construct the full path
  const pathKey = !path ? `${parentPath || ''}` : `${parentPathString}${path}`
  return {
    ...(privileges ? { [`/${pathKey}`]: privileges } : {}),
    ...(children
      ? reduce(
          children,
          (result, value) => {
            if (!value) return result
            return {
              ...result,
              ...getPathWithPrivileges({ ...value, parentPath: pathKey }),
            }
          },
          {}
        )
      : {}),
  }
}

export const constructFullPath = (originalPath: string, params: object) =>
  reduce(
    params,
    (result, value, key) => {
      if (!key) return result
      return replace(result, `:${key}`, value)
    },
    originalPath
  )

export const getUtcDateStringFromLocalDateObject = ({
  date,
  time,
}: {
  date?: string
  time?: string
}) => {
  const dayjsObject = dayjs(
    trim(`${date || ''} ${time || ''}`),
    'DD/MM/YYYY HH:mm:ss'
  )
  const formattedString = dayjsObject.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
  return formattedString
}

export const getLocalDateOjectFromUtcDateString = (datetime: string) => {
  const dayjsObject = dayjs(datetime)
  const localDateTimeString = dayjsObject.format('DD/MM/YYYY HH:mm:ss')
  const splitDateTime = split(localDateTimeString, ' ')
  return { date: splitDateTime[0], time: splitDateTime[1] }
}

type PrivilegeKeyValueType = {
  [key in PrivilegeKey]?: Privileges[]
}

const addablePrivilegesWithConditions: PrivilegeKeyValueType = {
  [Privileges.ViewRole]: [
    Privileges.AddRole,
    Privileges.EditRole,
    Privileges.DeleteRole,
  ],
  [Privileges.ViewUser]: [
    Privileges.AddUser,
    Privileges.EditUser,
    Privileges.ExportUser,
    Privileges.ActivateUser,
    Privileges.DeactivateUser,
    Privileges.ArchiveUser,
    Privileges.EditUserWorktime,
    Privileges.EditUserVacation,
  ],
  [Privileges.ViewTm]: [
    Privileges.CreateTm,
    Privileges.ImportTm,
    Privileges.ExportTm,
    Privileges.DeleteTm,
    Privileges.EditTmMetadata,
  ],
  [Privileges.ViewAuditLog]: [Privileges.ExportAuditLog],
  [Privileges.ViewVendorDb]: [
    Privileges.EditVendorDb,
    Privileges.ViewVendorTask,
    Privileges.ViewGeneralPricelist,
  ],
  [Privileges.ViewInstitutionPriceRate]: [Privileges.EditInstitutionPriceRate],
  [Privileges.ViewPersonalProject]: [
    Privileges.CreateProject,
    Privileges.ManageProject,
    Privileges.ChangeClient,
    Privileges.ReceiveProject,
  ],
  [Privileges.ManageProject]: [Privileges.ReceiveProject],
}

export const getAllNewPrivileges = (selectedPrivileges: PrivilegeType[]) => {
  const selectedByDefaultPrivileges = flatMap(selectedPrivileges, ({ key }) => {
    const filteredArray = pickBy(
      addablePrivilegesWithConditions,
      (conditionsArray) => includes(conditionsArray, key)
    )
    const addablePrivileges = keys(filteredArray)
    return map(addablePrivileges as Privileges[], (privilege) => ({
      key: privilege,
    }))
  })
  const allNewPrivileges: PrivilegeType[] = uniqBy(
    [...selectedPrivileges, ...selectedByDefaultPrivileges],
    'key'
  )
  return allNewPrivileges
}
