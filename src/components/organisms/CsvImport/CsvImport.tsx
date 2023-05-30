import { ChangeEvent, FC, FormEvent, useState } from 'react'
import Button from 'components/molecules/Button/Button'

import classes from './styles.module.scss'
import classNames from 'classnames'

export enum InputFileTypes {
  Csv = '.csv',
}

export type CsvImportProps = {
  className?: string
  inputFileType: InputFileTypes
  name?: string
}

type CsvObject = Record<string, string>

const CsvImport: FC<CsvImportProps> = ({ className, inputFileType, name }) => {
  const [file, setFile] = useState<File | undefined>()
  const [array, setArray] = useState<CsvObject[]>([])

  const fileReader = new FileReader()

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const csvFileToArray = (string: string): void => {
    const csvHeader = string.slice(0, string.indexOf('\n')).split(',')
    const csvRows = string.slice(string.indexOf('\n') + 1).split('\n')

    const array = csvRows.map((i) => {
      const values = i.split(',')
      const obj: CsvObject = csvHeader.reduce((object, header, index) => {
        object[header as keyof CsvObject] = values[index]
        return object
      }, {} as CsvObject)
      return obj
    })

    setArray(array)
  }

  const handleOnSubmit = (e: FormEvent): void => {
    e.preventDefault()

    if (file) {
      fileReader.onload = function (event: ProgressEvent<FileReader>): void {
        if (event.target && event.target.result) {
          const csvOutput: string = event.target.result.toString()
          console.log(csvOutput)
          csvFileToArray(csvOutput)
        }
      }

      fileReader.readAsText(file)
    }
  }

  const headerKeys = Object.keys(Object.assign({}, ...array)) as string[]

  return (
    <div className={classNames(classes.container, className)}>
      <h1>Csv import</h1>
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
        >
          Lisa.csv
        </Button>
      </form>

      <br />

      <table>
        <thead>
          <tr key={'header'}>
            {headerKeys.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {array.map((item, index) => (
            <tr key={index}>
              {Object.values(item).map((val, valIndex) => (
                <td key={valIndex}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CsvImport
