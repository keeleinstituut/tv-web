import { FC, ReactElement } from 'react'

export type SubRowAuditLog = {
  label: string
  Component: () => ReactElement
}

type LogsSubRowTableProps = {
  rowData?: any
  hidden?: boolean
}

const LogsSubRowTable: FC<LogsSubRowTableProps> = ({ rowData }) => {
  return (
    <table>
      <tbody>
        <tr>
          <td style={{ borderBottom: 'none', width: 180 }}>{rowData.label}</td>
          <td style={{ borderBottom: 'none' }}>
            <rowData.Component />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default LogsSubRowTable
