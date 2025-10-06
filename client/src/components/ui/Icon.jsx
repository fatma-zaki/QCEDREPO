import React from 'react';
import { 
  Search, Download, Phone, User, LogIn, Globe, Lock, Eye, EyeOff,
  Edit, Trash2, Plus, X, Check, AlertTriangle, Info, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Calendar, Clock, Mail, MapPin, Building, Users,
  Settings, Menu, Filter, SortAsc, SortDesc, MoreVertical,
  Home, LayoutDashboard, UserCheck, FileText, BarChart3, MessageSquare
} from 'lucide-react';

// Icon mapping for consistent usage
const iconMap = {
  // Navigation & Actions
  search: Search,
  download: Download,
  phone: Phone,
  user: User,
  login: LogIn,
  globe: Globe,
  lock: Lock,
  eye: Eye,
  eyeOff: EyeOff,
  edit: Edit,
  delete: Trash2,
  add: Plus,
  close: X,
  check: Check,
  warning: AlertTriangle,
  info: Info,
  
  // Arrows & Navigation
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // Business Icons
  calendar: Calendar,
  clock: Clock,
  mail: Mail,
  mapPin: MapPin,
  building: Building,
  users: Users,
  
  // Interface Icons
  settings: Settings,
  menu: Menu,
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,
  more: MoreVertical,
  
  // Dashboard Icons
  home: Home,
  dashboard: LayoutDashboard,
  userCheck: UserCheck,
  fileText: FileText,
  chart: BarChart3,
  message: MessageSquare,
};

/**
 * Unified Icon component with consistent sizing and styling
 */
const Icon = ({ 
  name, 
  size = 'default', 
  className = '', 
  color = 'currentColor',
  ...props 
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
    '2xl': 'h-12 w-12',
  };

  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${className}`}
      color={color}
      {...props}
    />
  );
};

export default Icon;
