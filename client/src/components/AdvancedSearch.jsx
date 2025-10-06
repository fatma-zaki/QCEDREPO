import React, { useState } from 'react'
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react'

const AdvancedSearch = ({ 
  searchTerm, 
  onSearchChange, 
  filterDepartment, 
  onFilterChange, 
  sortBy, 
  onSortChange, 
  sortOrder, 
  onSortOrderChange,
  departments,
  showAdvanced = false,
  onToggleAdvanced
}) => {
  const [showFilters, setShowFilters] = useState(showAdvanced)

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'extension', label: 'Extension' },
    { value: 'department', label: 'Department' },
    { value: 'email', label: 'Email' },
    { value: 'createdAt', label: 'Date Added' }
  ]

  const clearFilters = () => {
    onSearchChange('')
    onFilterChange('')
    onSortChange('name')
    onSortOrderChange('asc')
  }

  const hasActiveFilters = searchTerm || filterDepartment || sortBy !== 'name' || sortOrder !== 'asc'

  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      {/* Basic Search */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, extension, email, or department..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            showFilters 
              ? 'bg-qassim-blue text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => onFilterChange(e.target.value)}
              className="input-field"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="input-field"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => onSortOrderChange('asc')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  sortOrder === 'asc'
                    ? 'bg-qassim-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SortAsc className="h-4 w-4 mr-1" />
                Ascending
              </button>
              <button
                onClick={() => onSortOrderChange('desc')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  sortOrder === 'desc'
                    ? 'bg-qassim-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SortDesc className="h-4 w-4 mr-1" />
                Descending
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch
