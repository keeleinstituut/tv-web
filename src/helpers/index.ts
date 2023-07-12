import { omit, map, split, trim, reduce, values, join, compact } from 'lodash'

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
      return reduce(
        valuesArray,
        (result, value, index) => {
          if (!index && index !== 0) {
            return result
          }
          return {
            ...result,
            [usersCsvFieldsToKeys[keysArray[index]]]: value,
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
  console.log('blob', blob)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}
