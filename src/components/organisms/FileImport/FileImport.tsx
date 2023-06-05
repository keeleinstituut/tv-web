// import { ChangeEvent, FC, useState, useRef } from 'react'
// import Button, { ButtonProps } from 'components/molecules/Button/Button'
// import classNames from 'classnames'
// import { ReactComponent as Delete } from 'assets/icons/delete.svg'
// import { ReactComponent as File } from 'assets/icons/file.svg'

// import classes from './styles.module.scss'

// export enum InputFileTypes {
//   Csv = '.csv',
// }

// interface FileImportProps extends ButtonProps {
//   inputFileType: InputFileTypes
//   name?: string
//   helperText?: string
//   buttonText?: string
//   fileLabel?: string
//   kilobytesLabel?: string
//   megabytesLabel?: string
//   onClick?: () => void
//   error?: string
// }

// const FileImport: FC<FileImportProps> = ({
//   className,
//   inputFileType,
//   name,
//   helperText,
//   buttonText,
//   icon,
//   appearance,
//   size,
//   ariaLabel,
//   iconPositioning,
//   error,
//   disabled,
//   fileLabel,
//   kilobytesLabel,
//   megabytesLabel,
//   onClick,
// }) => {
//   const fileInputRef = useRef<HTMLInputElement | null>(null)
//   const [file, setFile] = useState<string>('')
//   const [fileSize, setFileSize] = useState<string>('')
//   const [fileName, setFileName] = useState<string>('')

//   const fileReader = new FileReader()

//   const formatFileSize = (sizeInBytes: number): string => {
//     const kilobytes = sizeInBytes / 1024
//     if (kilobytes < 1024) {
//       return kilobytes.toFixed(2) + ` ${kilobytesLabel}`
//     }

//     const megabytes = kilobytes / 1024
//     return megabytes.toFixed(2) + ` ${megabytesLabel}`
//   }

//   fileReader.onload = function (event: ProgressEvent<FileReader>): void {
//     if (event.target && event.target.result) {
//       const fileOutput: string = event.target.result.toString()
//       setFile(fileOutput)

//       const fileInput = fileInputRef.current
//       if (fileInput && fileInput.files && fileInput.files.length > 0) {
//         const selectedFile = fileInput.files[0]
//         setFileName(selectedFile.name)
//         setFileSize(formatFileSize(selectedFile.size))
//       }
//     }
//   }

//   const handleOnChange = (event: ChangeEvent<HTMLInputElement>): void => {
//     if (event.target.files && event.target.files.length > 0) {
//       const selectedFile = event.target.files[0]
//       fileReader.readAsText(selectedFile)
//     }
//   }

//   return (
//     <div className={classNames(className)}>
//       <form>
//         <Button
//           onClick={() => {
//             if (fileInputRef.current) {
//               fileInputRef.current.click()
//             }
//           }}
//           icon={icon}
//           appearance={appearance}
//           size={size}
//           ariaLabel={ariaLabel}
//           iconPositioning={iconPositioning}
//           disabled={disabled}
//         >
//           {buttonText}
//         </Button>

//         <input
//           ref={fileInputRef}
//           type="file"
//           id={name}
//           accept={inputFileType}
//           onChange={handleOnChange}
//           className={classes.fileInput}
//         />
//       </form>

//       <p hidden={!helperText} className={classes.helperText}>
//         {helperText}
//       </p>

//       <h5 hidden={!file} className={classes.fileLabel}>
//         {fileLabel}
//       </h5>
//       <div
//         hidden={!file}
//         className={classNames(
//           file && classes.fileContainer,
//           error && classes.errorContainer
//         )}
//       >
//         <File className={classes.icon} />
//         <div className={classes.fileDetailsContainer}>
//           <p className={classes.fileName}>{fileName}</p>
//           <p className={classes.fileSize}>{fileSize}</p>
//         </div>
//         <Delete onClick={onClick} />
//       </div>

//       <p hidden={!error} className={classes.errorText}>
//         {error}
//       </p>

//       {file}
//     </div>
//   )
// }

// export default FileImport

import React, { FC, useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as File } from 'assets/icons/file.svg'
import { ButtonProps } from 'components/molecules/Button/Button'
import classNames from 'classnames'

import classes from './styles.module.scss'

export enum InputFileTypes {
  Csv = '.csv',
}

interface FileImportProps extends ButtonProps {
  // inputFileType: InputFileTypes
  name?: string
  helperText?: string
  buttonText?: string
  fileLabel?: string
  kilobytesLabel?: string
  megabytesLabel?: string
  onClick?: () => void
  error?: string
}

const DragAndDrop: FC<FileImportProps> = ({
  helperText,
  fileLabel,
  onClick,
  error,
}) => {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onload = () => {
        const fileContent = reader.result as string
        console.log(fileContent)
      }

      reader.readAsText(file)
    })

    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <>
            <p>Drag & drop a file here, or BUTTON</p>
            <p>To choose multiple files hold down CTRL/CMND</p>
          </>
        )}
        {files.length > 0 && (
          <div>
            <h4>Uploaded Files:</h4>
            <ul>
              {files.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p
        //  hidden={!helperText}
        className={classes.helperText}
      >
        {helperText}
      </p>
      <h5
        // hidden={!files}
        className={classes.fileLabel}
      >
        {fileLabel}
      </h5>
      <div
        // hidden={!files}
        className={classNames(
          files && classes.fileContainer,
          error && classes.errorContainer
        )}
      >
        <File className={classes.icon} />
        <div className={classes.fileDetailsContainer}>
          {/* <p className={classes.fileName}>{fileName}</p> */}
          {/* <p className={classes.fileSize}>{fileSize}</p> */}
        </div>
        <Delete onClick={onClick} />
      </div>
      <p hidden={!error} className={classes.errorText}>
        {error}
      </p>
      {/* {files} */}
    </>
  )
}

const FileImport: FC<FileImportProps> = ({
  helperText,
  fileLabel,
  onClick,
  error,
}) => {
  return (
    <DragAndDrop
      helperText={helperText}
      fileLabel={fileLabel}
      onClick={onClick}
      error={error}
    />
  )
}

export default FileImport
