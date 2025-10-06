import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, CalendarIcon, PencilIcon, CheckIcon, XMarkIcon, UsersIcon } from '@heroicons/react/24/outline';
import { fetchEmployees } from '../store/slices/employeeSlice';
import { fetchDepartments } from '../store/slices/departmentSlice';

/**
 * SchedulePage - Role-based schedule management
 * 
 * Role Permissions:
 * - Admin: Can manage all department schedules, view all actions
 * - Manager: Can manage only their assigned department schedule, view action history
 * - Employee: Read-only access to view schedules, cannot edit or publish
 * 
 * Features:
 * - Audit logging for all schedule actions (create, update, publish)
 * - Action history display with user names, dates, and times
 * - Department filtering based on user permissions
 * - Real-time schedule updates with proper error handling
 */

const SchedulePage = () => {
  try {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth || {});
    const { employees = [], loading: employeesLoading = false } = useSelector((state) => state.employees || {});
    const { departments = [], loading: departmentsLoading = false } = useSelector((state) => state.departments || {});

    // Debug logging
    console.log('SchedulePage render:', { user, departments, employees });
  
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tempSchedule, setTempSchedule] = useState(null);
  const [status, setStatus] = useState({ msg: null, err: null });
  const [scheduleHistory, setScheduleHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Get current week start (Monday)
  const getCurrentWeekStart = () => {
    try {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today);
      monday.setDate(diff);
      return monday.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error getting current week start:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (user) {
      try {
        dispatch(fetchDepartments());
        dispatch(fetchEmployees());
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setStatus({ err: 'Failed to load initial data', msg: null });
      }
    }
  }, [dispatch, user]);

  // Get departments that the current user can manage
  const getManageableDepartments = () => {
    if (user?.role === 'admin') {
      return departments;
    } else if (user?.role === 'manager') {
      return departments.filter(dept => dept.manager === user._id);
    }
    return [];
  };

  const manageableDepartments = getManageableDepartments();

  useEffect(() => {
    try {
      if (!selectedWeek) {
        setSelectedWeek(getCurrentWeekStart());
      }
      
      // Set default department based on user role
      if (!selectedDepartment) {
        console.log('Setting default department for user:', { 
          role: user?.role, 
          departmentsCount: departments.length, 
          manageableCount: manageableDepartments.length,
          userDepartment: user?.department 
        });
        
        if (user?.role === 'admin' && departments.length > 0) {
          console.log('Setting admin department:', departments[0]._id);
          setSelectedDepartment(departments[0]._id);
        } else if (user?.role === 'manager' && manageableDepartments.length > 0) {
          console.log('Setting manager department:', manageableDepartments[0]._id);
          setSelectedDepartment(manageableDepartments[0]._id);
        } else if (user?.role === 'employee') {
          // For employees, try to find their department
          console.log('Looking for employee department:', user?.department);
          if (user?.department) {
            // If user has a department object, use its ID
            const deptId = typeof user.department === 'object' ? user.department._id : user.department;
            console.log('Setting employee department from user:', deptId);
            setSelectedDepartment(deptId);
          } else {
            // Fallback: try to find department by employee ID
            const employeeDept = departments.find(dept => 
              dept.employees?.some(emp => emp._id === user._id)
            );
            if (employeeDept) {
              console.log('Setting employee department from search:', employeeDept._id);
              setSelectedDepartment(employeeDept._id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in department selection useEffect:', error);
    }
  }, [departments, selectedWeek, user, manageableDepartments]);

  useEffect(() => {
    if (selectedDepartment && selectedWeek) {
      fetchSchedule();
    }
  }, [selectedDepartment, selectedWeek]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      console.log('Fetching schedule with:', { selectedDepartment, selectedWeek, token: token ? 'present' : 'missing' });
      
      if (!selectedDepartment) {
        console.error('No department selected');
        setStatus({ err: 'No department selected', msg: null });
        return;
      }
      
      if (!token) {
        console.error('No authentication token');
        setStatus({ err: 'Authentication required', msg: null });
        return;
      }
      
      const res = await axios.get(`/api/schedules/department/${selectedDepartment}?weekStart=${selectedWeek}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Schedule response:', res.data);
      setSchedule(res.data.data);
      
      // Fetch schedule history if schedule exists
      if (res.data.data && res.data.data._id) {
        await fetchScheduleHistory(res.data.data._id);
      }
    } catch (error) {
      console.error('Fetch schedule error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setStatus({ err: 'Failed to fetch schedule', msg: null });
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleHistory = async (scheduleId) => {
    try {
      const res = await axios.get(`/api/schedules/${scheduleId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScheduleHistory(res.data.data);
    } catch (error) {
      console.error('Fetch schedule history error:', error);
    }
  };

  const handleEdit = () => {
    console.log('Starting edit mode:', { schedule, user: user?.role, canEdit });
    setEditing(true);
    
    if (schedule) {
      setTempSchedule(JSON.parse(JSON.stringify(schedule)));
    } else {
      // Create a new schedule template with employees from the selected department
      console.log('Creating new schedule template');
      const departmentEmployees = employees.filter(emp => 
        emp.department === selectedDepartment || 
        emp.department?._id === selectedDepartment ||
        emp.department?.name === departments.find(d => d._id === selectedDepartment)?.name
      );
      
      const shifts = departmentEmployees.map(employee => {
        const shift = { employee };
        // Initialize all days with default values
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
          shift[day] = {
            isWorking: day === 'saturday' || day === 'sunday' ? false : true,
            startTime: '09:00',
            endTime: '17:00'
          };
        });
        return shift;
      });
      
      const newSchedule = {
        department: selectedDepartment,
        weekStart: selectedWeek,
        shifts: shifts,
        isPublished: false
      };
      setTempSchedule(newSchedule);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setTempSchedule(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('Saving schedule:', { selectedDepartment, selectedWeek, user: user?.role });
      
      const res = await axios.post('/api/schedules', {
        departmentId: selectedDepartment,
        weekStart: selectedWeek,
        shifts: tempSchedule.shifts,
        isPublished: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Schedule saved successfully:', res.data);
      setSchedule(res.data.data);
      setEditing(false);
      setTempSchedule(null);
      setStatus({ msg: 'Schedule saved successfully', err: null });
    } catch (error) {
      console.error('Save schedule error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save schedule';
      setStatus({ err: errorMessage, msg: null });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/schedules/${schedule._id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ msg: 'Schedule published successfully', err: null });
      fetchSchedule();
    } catch (error) {
      console.error('Publish schedule error:', error);
      setStatus({ err: 'Failed to publish schedule', msg: null });
    } finally {
      setLoading(false);
    }
  };

  const updateShift = (employeeIndex, day, field, value) => {
    if (!tempSchedule) return;
    
    const newSchedule = { ...tempSchedule };
    newSchedule.shifts[employeeIndex][day][field] = value;
    setTempSchedule(newSchedule);
  };

  const getDayName = (day) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days[day];
  };

  const getDayLabel = (day) => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels[day];
  };

  // Enhanced role-based permissions
  const canEdit = user?.role === 'admin' || 
    (user?.role === 'manager' && departments.find(d => d._id === selectedDepartment)?.manager === user._id);
  
  const canView = user?.role === 'admin' || 
    user?.role === 'manager' || 
    user?.role === 'employee';
  
  const isReadOnly = user?.role === 'employee';

  const currentSchedule = editing ? tempSchedule : schedule;

  // Show loading state while fetching initial data
  if (departmentsLoading || employeesLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading schedule data...</span>
        </div>
      </div>
    );
  }

  // Safety check for user authentication
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-2 text-sm text-gray-500">Please log in to access the schedule.</p>
        </div>
      </div>
    );
  }

  // Show message if no departments are available
  if (!departmentsLoading && departments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No departments available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please create departments before managing schedules.
          </p>
        </div>
      </div>
    );
  }

  // Error fallback
  if (status.err) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-4">
            <h3 className="font-medium">Error Loading Schedule</h3>
            <p className="mt-1">{status.err}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Weekly Schedule</h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-sm text-gray-600">
                Role: <span className="font-medium capitalize">{user?.role}</span>
              </span>
              {isReadOnly && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Read Only
                </span>
              )}
            </div>
          </div>
        </div>
        
        {canView && schedule && (
          <div className="flex space-x-2">
            {canEdit && !editing && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Schedule
                </button>
                {!schedule.isPublished && (
                  <button
                    onClick={handlePublish}
                    className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Publish
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
        )}
        
        {editing && (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={editing || departmentsLoading || isReadOnly}
            >
              {departmentsLoading ? (
                <option>Loading departments...</option>
              ) : user?.role === 'admin' ? (
                departments.length > 0 ? (
                  departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))
                ) : (
                  <option>No departments available</option>
                )
              ) : user?.role === 'manager' ? (
                manageableDepartments.length > 0 ? (
                  manageableDepartments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name} (Your Department)</option>
                  ))
                ) : (
                  <option>No departments assigned to you</option>
                )
              ) : (
                selectedDepartment ? (
                  <option value={selectedDepartment}>
                    {departments.find(d => d._id === selectedDepartment)?.name || 'Current Department'}
                  </option>
                ) : (
                  <option>No department assigned</option>
                )
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Week Starting</label>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={editing || isReadOnly}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchSchedule}
              disabled={loading || editing}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status.err && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-4">
          {status.err}
        </div>
      )}
      {status.msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded p-3 mb-4">
          {status.msg}
        </div>
      )}

      {/* Action History */}
      {showHistory && scheduleHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Action History</h3>
          <div className="space-y-3">
            {scheduleHistory.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {action.actor?.firstName?.[0] || 'U'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {action.actor?.firstName} {action.actor?.lastName}
                      <span className="ml-2 text-xs text-gray-500">({action.actor?.role})</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {action.action === 'schedule.create' && 'Created schedule'}
                      {action.action === 'schedule.update' && 'Updated schedule'}
                      {action.action === 'schedule.publish' && 'Published schedule'}
                      {action.metadata?.shiftsCount && ` - ${action.metadata.shiftsCount} shifts`}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(action.createdAt).toLocaleDateString()} at {new Date(action.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : currentSchedule ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {departments.find(d => d._id === selectedDepartment)?.name} Schedule
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  currentSchedule.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentSchedule.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  {Array.from({ length: 7 }, (_, i) => (
                    <th key={i} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getDayLabel(i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSchedule.shifts?.length > 0 ? (
                  currentSchedule.shifts.map((shift, shiftIndex) => (
                  <tr key={shiftIndex} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {shift.employee?.name?.[0] || shift.employee?.firstName?.[0] || shift.employee?.username?.[0] || 'E'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {shift.employee?.name || shift.employee?.firstName || 'Unknown'} {shift.employee?.lastName || ''}
                          </div>
                          <div className="text-sm text-gray-500">{shift.employee?.position || shift.employee?.extension || 'No position'}</div>
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = getDayName(dayIndex);
                      const shiftData = shift[day];
                      
                      return (
                        <td key={dayIndex} className="px-6 py-4 text-center">
                          {editing && !isReadOnly ? (
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={shiftData.isWorking}
                                  onChange={(e) => updateShift(shiftIndex, day, 'isWorking', e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-xs text-gray-600">Working</span>
                              </label>
                              {shiftData.isWorking && (
                                <div className="space-y-1">
                                  <input
                                    type="time"
                                    value={shiftData.startTime || '09:00'}
                                    onChange={(e) => updateShift(shiftIndex, day, 'startTime', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <input
                                    type="time"
                                    value={shiftData.endTime || '17:00'}
                                    onChange={(e) => updateShift(shiftIndex, day, 'endTime', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm">
                              {shiftData.isWorking ? (
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {shiftData.startTime} - {shiftData.endTime}
                                  </div>
                                  <div className="text-green-600 text-xs">Working</div>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-xs">Off</div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <UsersIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm">No employees found in this department</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {editing ? 'Add employees to this department to create a schedule' : 'No employees available'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {canEdit ? 'Create a schedule for this week' : 'No schedule available for this week'}
          </p>
          {canEdit && (
            <div className="mt-4">
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Create New Schedule
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('SchedulePage error:', error);
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-4">
            <h3 className="font-medium">Application Error</h3>
            <p className="mt-1">Something went wrong while loading the schedule page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default SchedulePage;
