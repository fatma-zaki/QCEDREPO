import { Plus, Edit, Trash2, Download, FileSpreadsheet, FileText } from 'lucide-react'

const ActionButton = ({ 
  type = 'primary', // primary, secondary, danger, success, warning
  variant = 'button', // button, icon
  icon, // custom icon component
  iconType, // predefined icon types: add, edit, delete, download, export-csv, export-excel
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const getIcon = () => {
    if (icon) return icon
    if (iconType === 'add') return <Plus className="h-4 w-4" />
    if (iconType === 'edit') return <Edit className="h-4 w-4" />
    if (iconType === 'delete') return <Trash2 className="h-4 w-4" />
    if (iconType === 'download') return <Download className="h-4 w-4" />
    if (iconType === 'export-csv') return <FileSpreadsheet className="h-4 w-4" />
    if (iconType === 'export-excel') return <FileText className="h-4 w-4" />
    return null
  }

  const getButtonClasses = () => {
    const baseClasses = 'font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center disabled:opacity-50'
    
    if (variant === 'icon') {
      const iconClasses = {
        primary: 'p-2 text-gray-400 hover:text-qassim-blue',
        danger: 'p-2 text-gray-400 hover:text-red-600',
        secondary: 'p-2 text-gray-400 hover:text-gray-600'
      }
      return `${iconClasses[type] || iconClasses.primary} ${className}`
    }

    const buttonClasses = {
      primary: 'glass-effect text-white hover:bg-white/20',
      secondary: 'glass-effect text-qassim-blue hover:bg-white/20',
      danger: 'glass-effect text-red-600 hover:bg-white/20',
      success: 'glass-effect text-green-600 hover:bg-white/20',
      warning: 'glass-effect text-yellow-600 hover:bg-white/20'
    }
    
    return `${baseClasses} ${buttonClasses[type] || buttonClasses.primary} ${className}`
  }

  const iconElement = getIcon()
  const showIcon = iconElement && (variant === 'icon' || children)

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={getButtonClasses()}
      {...props}
    >
      {showIcon && (
        <span className={children ? 'mr-2' : ''}>
          {iconElement}
        </span>
      )}
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default ActionButton
