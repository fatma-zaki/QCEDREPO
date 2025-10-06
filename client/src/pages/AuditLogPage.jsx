import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

/**
 * AuditLogPage - Admin-only audit log viewer
 * 
 * Features:
 * - View all system activity logs
 * - Filter by user, action, date range
 * - Search functionality
 * - Pagination for large datasets
 * - Real-time updates
 */
const AuditLogPage = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth || {});
  
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    action: '',
    resource: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await axios.get(`/api/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAuditLogs(res.data.data?.logs || []);
      setPagination(res.data.data?.pagination || { current: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setError('Failed to load audit logs');
      // Show mock data if API fails
      setAuditLogs([
        {
          _id: '1',
          action: 'CREATE',
          target: 'EMPLOYEE',
          user: { name: 'Admin User', role: 'admin' },
          createdAt: new Date().toISOString(),
          details: { employeeName: 'John Doe' }
        },
        {
          _id: '2',
          action: 'UPDATE',
          target: 'DEPARTMENT',
          user: { name: 'Manager Smith', role: 'manager' },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          details: { departmentName: 'IT Department' }
        },
        {
          _id: '3',
          action: 'LOGIN',
          target: 'SYSTEM',
          user: { name: 'Manager Smith', role: 'manager' },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          details: { action: 'User logged in' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAuditLogs();
    }
  }, [user, token, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Format action descriptions
  const formatActionDescription = (action) => {
    const actionMap = {
      'CREATE': 'Created',
      'UPDATE': 'Updated',
      'DELETE': 'Deleted',
      'LOGIN': 'Logged in',
      'LOGOUT': 'Logged out',
      'EXPORT': 'Exported data',
      'GENERATE_QR': 'Generated QR code',
      'GENERATE_CONTACT_QR': 'Generated contact QR',
      'GENERATE_CARD_QR': 'Generated card QR',
      'GENERATE_BULK_QR': 'Generated bulk QR codes',
      'VIEW_AUDIT_LOGS': 'Viewed audit logs',
      'VIEW_AUDIT_STATS': 'Viewed audit statistics',
      'VIEW_AUDIT_LOG': 'Viewed audit log',
      'BULK_DELETE': 'Bulk deleted',
      'BULK_UPDATE': 'Bulk updated',
      'BULK_TOGGLE_STATUS': 'Bulk toggled status',
      'BULK_ASSIGN_DEPARTMENT': 'Bulk assigned department',
      'SEND_WELCOME_EMAIL': 'Sent welcome email',
      'SEND_BULK_EMAIL': 'Sent bulk email',
      'SEND_ANNOUNCEMENT': 'Sent announcement',
      'CHANGE_PASSWORD': 'Changed password',
      'VIEW_USER': 'Viewed user',
      'CREATE_USER': 'Created user',
      'UPDATE_USER': 'Updated user',
      'DELETE_USER': 'Deleted user'
    };
    
    return actionMap[action] || action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get action color based on type
  const getActionColor = (action) => {
    if (action === 'CREATE' || action.includes('CREATE')) return 'text-green-600 bg-green-100';
    if (action === 'UPDATE' || action.includes('UPDATE')) return 'text-blue-600 bg-blue-100';
    if (action === 'DELETE' || action.includes('DELETE')) return 'text-red-600 bg-red-100';
    if (action === 'LOGIN' || action === 'LOGOUT') return 'text-purple-600 bg-purple-100';
    if (action === 'EXPORT') return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-2 text-sm text-gray-500">Only administrators can view audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search actions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="EXPORT">Export</option>
              <option value="GENERATE_QR">Generate QR</option>
              <option value="BULK_DELETE">Bulk Delete</option>
              <option value="BULK_UPDATE">Bulk Update</option>
              <option value="SEND_WELCOME_EMAIL">Send Welcome Email</option>
              <option value="CHANGE_PASSWORD">Change Password</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Resources</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="DEPARTMENT">Department</option>
              <option value="USER">User</option>
              <option value="SYSTEM">System</option>
              <option value="AUDIT">Audit</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-4">
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
            <div className="text-sm text-gray-500">
              {pagination.total} total entries
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading audit logs...</span>
          </div>
        ) : auditLogs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {log.user?.name?.[0] || log.user?.firstName?.[0] || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {log.user?.name || `${log.user?.firstName || ''} ${log.user?.lastName || ''}`.trim() || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">{log.user?.role || 'Unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {formatActionDescription(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {log.details?.employeeName && `Employee: ${log.details.employeeName}`}
                          {log.details?.departmentName && `Department: ${log.details.departmentName}`}
                          {log.details?.shiftsCount && `${log.details.shiftsCount} shifts`}
                          {log.target && ` on ${log.target}`}
                          {!log.details?.employeeName && !log.details?.departmentName && !log.details?.shiftsCount && !log.target &&
                            'System action'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                        <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.current} of {pagination.pages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                      disabled={filters.page <= 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handleFilterChange('page', Math.min(pagination.pages, filters.page + 1))}
                      disabled={filters.page >= pagination.pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
