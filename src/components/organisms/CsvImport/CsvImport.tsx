import { ChangeEvent, FC, FormEvent, useState } from 'react'
import Button from 'components/molecules/Button/Button'
import { ReactComponent as Attach } from 'assets/icons/attach.svg'
import { map, reduce, toString } from 'lodash'
import classNames from 'classnames'

import classes from './styles.module.scss'

export enum InputFileTypes {
  Csv = '.csv',
}

type CsvImportProps = {
  className?: string
  inputFileType: InputFileTypes
  name?: string
  helperText?: string
  buttonText?: string
}

type CsvObject = Record<string, string>

const CsvImport: FC<CsvImportProps> = ({
  className,
  inputFileType,
  name,
  helperText,
  buttonText,
}) => {
  const [file, setFile] = useState<File | undefined>()
  const [csvArray, setCsvArray] = useState<CsvObject[]>([])

  const fileReader = new FileReader()

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }

  const csvFileToArray = (string: string): void => {
    const csvHeader = string.slice(0, string.indexOf('\n')).split(',')
    const csvRows = string.slice(string.indexOf('\n') + 1).split('\n')

    const csvRowsArray = map(csvRows, (row) => {
      const rowValues = row.split(',')
      const rowObject: CsvObject = reduce(
        csvHeader,
        (object, header, index) => {
          object[header as keyof CsvObject] = rowValues[index]
          return object
        },
        {} as CsvObject
      )
      return rowObject
    })
    setCsvArray(csvRowsArray)
  }

  const handleOnSubmit = (event: FormEvent): void => {
    event.preventDefault()

    if (file) {
      fileReader.onload = function (event: ProgressEvent<FileReader>): void {
        if (event.target && event.target.result) {
          const csvOutput: string = toString(event.target.result)
          csvFileToArray(csvOutput)
        }
      }
      fileReader.readAsText(file)
    }
  }

  const headerKeys = Object.keys(Object.assign({}, ...csvArray)) as string[]

  return (
    <div className={classNames(classes.container, className)}>
      <form>
        <input
          type="file"
          id={name}
          accept={inputFileType}
          onChange={handleOnChange}
        />

        <Button
          onClick={(e) => {
            handleOnSubmit(e)
          }}
          icon={Attach}
        >
          {buttonText}
        </Button>
      </form>

      <table>
        <thead>
          <tr key="header">
            {map(headerKeys, (key) => {
              return <th key={key}>{key}</th>
            })}
          </tr>
        </thead>

        <tbody>
          {map(csvArray, (row, index) => {
            return (
              <tr key={index}>
                {map(Object.values(row), (rowValue, index) => {
                  return <td key={index}>{rowValue}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <p hidden={!helperText} className={classes.helperText}>
        {helperText}
      </p>
    </div>
  )
}

export default CsvImport
