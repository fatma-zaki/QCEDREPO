// Mock data for development when backend is not available
export const mockDepartments = [
  {
    _id: '1',
    name: 'Human Resources',
    description: 'Manages employee relations and policies'
  },
  {
    _id: '2',
    name: 'Information Technology',
    description: 'Handles all technical infrastructure and support'
  },
  {
    _id: '3',
    name: 'Finance',
    description: 'Manages company finances and accounting'
  },
  {
    _id: '4',
    name: 'Marketing',
    description: 'Promotes company products and services'
  },
  {
    _id: '5',
    name: 'Operations',
    description: 'Oversees daily business operations'
  }
]

export const mockEmployees = [
  {
    _id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    extension: 1001,
    department: mockDepartments[0]
  },
  {
    _id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    extension: 1002,
    department: mockDepartments[1]
  },
  {
    _id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    extension: 1003,
    department: mockDepartments[2]
  },
  {
    _id: '4',
    name: 'Emily Wilson',
    email: 'emily.wilson@company.com',
    extension: 1004,
    department: mockDepartments[3]
  },
  {
    _id: '5',
    name: 'David Brown',
    email: 'david.brown@company.com',
    extension: 1005,
    department: mockDepartments[4]
  },
  {
    _id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    extension: 1006,
    department: mockDepartments[1]
  },
  {
    _id: '7',
    name: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    extension: 1007,
    department: mockDepartments[0]
  },
  {
    _id: '8',
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@company.com',
    extension: 1008,
    department: mockDepartments[2]
  }
]
