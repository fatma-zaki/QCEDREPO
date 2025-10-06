import { useSelector } from 'react-redux';

/**
 * Custom hook for role-based permissions
 */
const usePermission = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const hasRole = (role) => {
    if (!isAuthenticated || !user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!isAuthenticated || !user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : false;
  };

  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    return user.permissions && user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!isAuthenticated || !user) return false;
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => user.permissions && user.permissions.includes(permission));
  };

  const canAccess = (resource, action = 'read') => {
    if (!isAuthenticated || !user) return false;
    
    const permission = `${resource}:${action}`;
    return user.permissions && user.permissions.includes(permission);
  };

  const isAdmin = () => hasRole('admin');
  const isHR = () => hasRole('hr');
  const isManager = () => hasRole('manager');
  const isEmployee = () => hasRole('employee');

  const canManageEmployees = () => hasAnyRole(['admin', 'hr']);
  const canViewReports = () => hasAnyRole(['admin', 'hr', 'manager']);
  const canManageDepartments = () => hasAnyRole(['admin', 'hr']);

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    canAccess,
    isAdmin,
    isHR,
    isManager,
    isEmployee,
    canManageEmployees,
    canViewReports,
    canManageDepartments,
  };
};

export default usePermission;
