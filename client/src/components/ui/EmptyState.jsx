import { Users, Building2, FileText, Search } from 'lucide-react'

const EmptyState = ({ 
  type = 'default', // default, employees, departments, search, files
  title = 'No items found',
  description = 'Get started by adding a new item.',
  icon,
  actions = []
}) => {
  const getIcon = () => {
    if (icon) return icon
    if (type === 'employees') return <Users className="mx-auto h-12 w-12 text-gray-400" />
    if (type === 'departments') return <Building2 className="mx-auto h-12 w-12 text-gray-400" />
    if (type === 'search') return <Search className="mx-auto h-12 w-12 text-gray-400" />
    if (type === 'files') return <FileText className="mx-auto h-12 w-12 text-gray-400" />
    return <Users className="mx-auto h-12 w-12 text-gray-400" />
  }

  return (
    <div className="text-center py-12">
      {getIcon()}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {actions.length > 0 && (
        <div className="mt-6 flex justify-center space-x-3">
          {actions.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmptyState