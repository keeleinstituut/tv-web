import { ChangeEvent, FC, useState, useRef, SetStateAction } from 'react'
import Button, { ButtonProps } from 'components/molecules/Button/Button'
import { map, reduce } from 'lodash'
import classNames from 'classnames'

import classes from './styles.module.scss'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'

export enum InputFileTypes {
  Csv = '.csv',
}

interface CsvImportProps extends ButtonProps {
  inputFileType: InputFileTypes
  name?: string
  helperText?: string
  buttonText?: string
  error?: FieldError
}

type CsvObject = Record<string, string>

const CsvImport: FC<CsvImportProps> = ({
  className,
  inputFileType,
  name,
  helperText,
  buttonText,
  icon,
  appearance,
  size,
  ariaLabel,
  iconPositioning,
  error,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [csvArray, setCsvArray] = useState<CsvObject[]>([])

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

  const fileReader = new FileReader()

  fileReader.onload = function (event: ProgressEvent<FileReader>): void {
    if (event.target && event.target.result) {
      const csvOutput: string = event.target.result.toString()

      csvFileToArray(csvOutput)
    }
  }

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]
      fileReader.readAsText(selectedFile)
    }
  }

  const headerKeys = Object.keys(Object.assign({}, ...csvArray)) as string[]

  return (
    <div className={classNames(className)}>
      <form>
        <Button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click()
            }
          }}
          icon={icon}
          appearance={appearance}
          size={size}
          ariaLabel={ariaLabel}
          iconPositioning={iconPositioning}
          disabled={disabled}
        >
          {buttonText}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          id={name}
          accept={inputFileType}
          onChange={handleOnChange}
          className={classes.fileInput}
        />
      </form>

      <p hidden={!helperText} className={classes.helperText}>
        {helperText}
      </p>

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
      <InputError {...error} />
    </div>
  )
}

export default CsvImport
