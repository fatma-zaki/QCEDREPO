import React from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import Button from './Button';
import Input from './Input';

/**
 * Universal search input component
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
  size = 'md'
}) => (
  <div className={`relative ${className}`}>
    <Input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      leftIcon={<Search className="w-4 h-4" />}
      rightIcon={value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
      size={size}
      className="pl-10"
    />
  </div>
);

/**
 * Filter dropdown component
 */
export const FilterDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select filter...',
  className = ''
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qassim-blue focus:border-transparent appearance-none bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

/**
 * Sort dropdown component
 */
export const SortDropdown = ({
  value,
  onChange,
  options = [],
  className = ''
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Sort by
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qassim-blue focus:border-transparent appearance-none bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

/**
 * Active filters display component
 */
export const ActiveFilters = ({
  filters = {},
  onRemoveFilter,
  onClearAll,
  className = ''
}) => {
  const activeFilters = Object.entries(filters).filter(([_, value]) => 
    value !== '' && value !== null && value !== undefined
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">Active filters:</span>
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {key}: {value}
          <button
            type="button"
            onClick={() => onRemoveFilter(key)}
            className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {onClearAll && (
        <Button
          variant="ghost"
          size="xs"
          onClick={onClearAll}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear all
        </Button>
      )}
    </div>
  );
};

/**
 * Advanced search component
 */
export const AdvancedSearch = ({
  searchTerm,
  onSearchChange,
  filters = {},
  onFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filterOptions = {},
  sortOptions = [],
  onClearAll,
  className = ''
}) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div className="lg:col-span-2">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search..."
          onClear={() => onSearchChange('')}
        />
      </div>

      {/* Filters */}
      {Object.entries(filterOptions).map(([key, options]) => (
        <FilterDropdown
          key={key}
          label={options.label}
          value={filters[key] || ''}
          onChange={(e) => onFilterChange(key, e.target.value)}
          options={options.options}
          placeholder={options.placeholder}
        />
      ))}

      {/* Sort */}
      <SortDropdown
        value={sortBy}
        onChange={onSortChange}
        options={sortOptions}
      />
    </div>

    {/* Active Filters */}
    <ActiveFilters
      filters={filters}
      onRemoveFilter={(key) => onFilterChange(key, '')}
      onClearAll={onClearAll}
      className="mt-4"
    />
  </div>
);

/**
 * Quick filter chips component
 */
export const FilterChips = ({
  options = [],
  selected = [],
  onToggle,
  className = ''
}) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onToggle(option.value)}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          selected.includes(option.value)
            ? 'bg-qassim-blue text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {option.icon && <option.icon className="w-4 h-4 mr-1" />}
        {option.label}
      </button>
    ))}
  </div>
);

/**
 * Search results summary component
 */
export const SearchResultsSummary = ({
  totalResults,
  filteredResults,
  searchTerm,
  filters = {},
  className = ''
}) => {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  if (totalResults === 0) return null;

  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      {hasActiveFilters || searchTerm ? (
        <>
          Showing {filteredResults} of {totalResults} results
          {(searchTerm || hasActiveFilters) && ' (filtered)'}
        </>
      ) : (
        `Showing ${totalResults} results`
      )}
    </div>
  );
};

/**
 * Search and filter toolbar
 */
export const SearchFilterToolbar = ({
  searchTerm,
  onSearchChange,
  filters = {},
  onFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filterOptions = {},
  sortOptions = [],
  onClearAll,
  showAdvanced = false,
  onToggleAdvanced,
  className = ''
}) => (
  <div className={`flex flex-col gap-4 ${className}`}>
    {/* Main toolbar */}
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search..."
          onClear={() => onSearchChange('')}
          className="min-w-64"
        />
        
        {showAdvanced && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAdvanced}
            icon={<Filter className="w-4 h-4" />}
          >
            Filters
          </Button>
        )}
      </div>

      {sortOptions.length > 0 && (
        <SortDropdown
          value={sortBy}
          onChange={onSortChange}
          options={sortOptions}
          className="min-w-48"
        />
      )}
    </div>

    {/* Advanced filters */}
    {showAdvanced && (
      <AdvancedSearch
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filters={filters}
        onFilterChange={onFilterChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        onClearAll={onClearAll}
      />
    )}

    {/* Active filters */}
    <ActiveFilters
      filters={filters}
      onRemoveFilter={(key) => onFilterChange(key, '')}
      onClearAll={onClearAll}
    />
  </div>
);

export default AdvancedSearch;
