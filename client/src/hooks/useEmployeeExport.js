import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { exportEmployees } from '../store/slices/employeeSlice'
import { useNotifications } from './useNotifications'
import { downloadBlob } from '../components/dashboard/dashboardUtils'

// The API's "excel" export is an .xlsx workbook
const EXTENSIONS = { csv: 'csv', excel: 'xlsx' }

/** Server-side employee export (CSV / Excel) with download + toast feedback. */
export const useEmployeeExport = () => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const [exporting, setExporting] = useState(null)

  const exportAs = useCallback(
    async (format) => {
      try {
        setExporting(format)
        const result = await dispatch(exportEmployees(format))
        if (exportEmployees.fulfilled.match(result)) {
          const ext = EXTENSIONS[format] || format
          downloadBlob(new Blob([result.payload.data]), `employees.${ext}`)
          showSuccess(`Employees exported to ${format === 'excel' ? 'Excel' : 'CSV'} successfully!`)
        } else {
          showError('Failed to export employees')
        }
      } catch (error) {
        console.error('Export failed:', error)
        showError('Export failed. Please try again.')
      } finally {
        setExporting(null)
      }
    },
    [dispatch, showSuccess, showError]
  )

  return { exportAs, exporting }
}

export default useEmployeeExport
