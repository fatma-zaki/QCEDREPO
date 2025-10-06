// UI Components
export { default as Button } from './ui/Button';
export { default as Input } from './ui/Input';
export { default as Card, CardHeader, CardBody, CardFooter } from './ui/Card';
// Modal components are self-contained, no separate exports needed
export { default as DataTable } from './ui/DataTable';
export { 
  LoadingOverlay,
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  ErrorState,
  ConditionalLoading
} from './ui/LoadingStates';
export {
  default as AdvancedSearch,
  SearchInput,
  FilterDropdown,
  SortDropdown,
  ActiveFilters,
  FilterChips,
  SearchResultsSummary,
  SearchFilterToolbar
} from './ui/SearchAndFilter';

// Layout Components (PageLayout removed - using DashboardLayout instead)

// Form Components
export { default as EmployeeForm } from './forms/EmployeeForm';

// New UI Components
export { default as Modal } from './ui/Modal';
export { default as ActionButton } from './ui/ActionButton';
export { default as QassimLoadingSpinner } from './ui/QassimLoadingSpinner';
export { default as EmptyState } from './ui/EmptyState';

// New Layout Components  
export { default as PageHeader } from './layout/PageHeader';
export { default as DashboardLayout } from './layout/DashboardLayout';

// Schedule Components
export { default as ScheduleManagement } from './schedule/ScheduleManagement';

// Micro Components
export { default as Icon } from './ui/Icon';
export { default as StatusBadge } from './ui/StatusBadge';
export { default as Avatar } from './ui/Avatar';
export { default as Tooltip } from './ui/Tooltip';

// Hooks
export { useFormState, createValidationRules, commonValidations } from '../hooks/useFormState';
export { useApi, useBackendStatus, useApiWithRetry } from '../hooks/useApi';
export { 
  useDataFetching, 
  useMultipleDataFetching, 
  usePaginatedData,
  useSearchAndFilter 
} from '../hooks/useDataFetching';
export { 
  useModal, 
  useMultipleModals, 
  useConfirmDialog, 
  useFormModal, 
  useDrawer,
  useToast 
} from '../hooks/useModal';
export { default as useLocalStorage } from '../hooks/useLocalStorage';
export { default as useDebounce } from '../hooks/useDebounce';
export { default as usePermission } from '../hooks/usePermission';

// Utilities
export { 
  default as exportData,
  toCSV,
  toExcel,
  toJSON,
  downloadFile,
  exportConfigs,
  useExport,
  formatDataForExport,
  formatters
} from '../utils/exportUtils';

// Example Components (removed - were for development/testing only)

// Existing Components (for backward compatibility)
export { default as ErrorBoundary } from './ErrorBoundary';
// Legacy LoadingSpinner removed - use LoadingSpinner from ui folder
export { default as PrivateRoute } from './PrivateRoute';
export { default as NotificationProvider } from './NotificationSystem';
export { default as PWAInstallPrompt } from './PWAInstallPrompt';
export { default as OfflineIndicator } from './OfflineIndicator';
