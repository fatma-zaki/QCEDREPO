# QCED Component Guide

## Overview

This guide documents the component library and design system for the QCED (Qassim Chamber Employee Directory) application. All components follow modern React patterns with TypeScript support, accessibility best practices, and responsive design.

## Design System

### Colors

- **Primary Blue**: `#002944` - Main brand color
- **Gold**: `#fbbf24` - Accent color
- **Gray Scale**: Extended gray palette for backgrounds, text, and borders

### Typography

- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700, 800, 900
- **Responsive Sizing**: Mobile-first approach with consistent scale

### Spacing

- **Base Unit**: 4px (0.25rem)
- **Scale**: 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

## Component Categories

### 1. Layout Components

#### Header
```jsx
import Header from '../components/layout/Header';

<Header />
```
- Responsive navigation with mobile menu
- Theme toggle and language switcher
- User profile access
- Notifications indicator

#### MobileNavigation
```jsx
import MobileNavigation from '../components/layout/MobileNavigation';

<MobileNavigation />
```
- Slide-out navigation for mobile devices
- Role-based menu items
- Touch-friendly interface

### 2. UI Components

#### Button
```jsx
import Button from '../components/ui/Button';

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' | 'ghost' | 'gold'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean

#### Card
```jsx
import Card from '../components/ui/Card';

<Card title="Card Title" subtitle="Optional subtitle">
  Card content
</Card>
```

**Props:**
- `title`: string
- `subtitle`: string
- `header`: ReactNode
- `footer`: ReactNode
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `hover`: boolean

#### OptimizedImage
```jsx
import OptimizedImage from '../components/ui/OptimizedImage';

<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={200}
  height={200}
  placeholder={true}
  fallback={true}
/>
```

**Features:**
- WebP format support with fallback
- Lazy loading with Intersection Observer
- Skeleton placeholder
- Error handling

### 3. Form Components

#### MobileForm Components
```jsx
import {
  MobileForm,
  FormGroup,
  FormLabel,
  FormInput,
  PasswordInput,
  FormError
} from '../components/ui/MobileForm';

<MobileForm>
  <FormGroup>
    <FormLabel required>Email</FormLabel>
    <FormInput
      type="email"
      placeholder="Enter your email"
      error={errors.email}
    />
    <FormError message={errors.email} />
  </FormGroup>
</MobileForm>
```

**Features:**
- Touch-friendly inputs (44px minimum height)
- Real-time validation feedback
- Accessible error messages
- Mobile-optimized styling

### 4. Data Display Components

#### ResponsiveTable
```jsx
import ResponsiveTable from '../components/ui/ResponsiveTable';

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'department', title: 'Department' },
  { key: 'extension', title: 'Extension' }
];

<ResponsiveTable
  data={employees}
  columns={columns}
  renderMobileCard={(row) => (
    <div>
      <h3>{row.name}</h3>
      <p>{row.department}</p>
    </div>
  )}
  showPagination={true}
  pageSize={10}
/>
```

**Features:**
- Desktop table view with horizontal scroll
- Mobile card view
- Sorting and pagination
- Loading states
- Empty states

### 5. Loading Components

#### Skeleton
```jsx
import { Skeleton, CardSkeleton, StatsSkeleton } from '../components/ui/LoadingStates';

<Skeleton width="w-3/4" height="h-4" lines={3} />
<CardSkeleton showAvatar={true} />
<StatsSkeleton count={4} />
```

**Variants:**
- `Skeleton`: Basic loading placeholder
- `CardSkeleton`: Card-shaped skeleton
- `StatsSkeleton`: Dashboard stats skeleton
- `TableSkeleton`: Table loading state
- `EmployeeCardSkeleton`: Employee card skeleton

### 6. Utility Components

#### ThemeToggle
```jsx
import ThemeToggle from '../components/ui/ThemeToggle';

<ThemeToggle variant="button" size="md" showLabel={false} />
```

**Features:**
- Light/Dark/System theme support
- Smooth transitions
- Persistent user preference

#### LanguageSwitcher
```jsx
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

<LanguageSwitcher
  currentLang="en"
  onLanguageChange={(lang) => setLanguage(lang)}
  size="md"
  showIcon={true}
/>
```

## Usage Guidelines

### 1. Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

### 2. Responsive Design

- Mobile-first approach
- Touch-friendly targets (44px minimum)
- Flexible layouts
- Optimized typography scaling

### 3. Performance

- React.memo for expensive components
- Lazy loading for images
- Code splitting for routes
- Optimized bundle size

### 4. Theming

- CSS custom properties for dynamic theming
- Dark mode support
- Consistent color tokens
- Typography scale

## Best Practices

### 1. Component Composition
```jsx
// Good: Composable components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardBody>
    Content
  </CardBody>
</Card>

// Avoid: Monolithic components
<ComplexCard title="Title" content="Content" />
```

### 2. Props Interface
```jsx
// Good: Clear, typed props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

// Avoid: Any props
interface ButtonProps {
  [key: string]: any;
}
```

### 3. Error Handling
```jsx
// Good: Error boundaries and fallbacks
<RouteErrorBoundary>
  <ExpensiveComponent />
</RouteErrorBoundary>

// Good: Loading states
{loading ? <Skeleton /> : <Content />}
```

## Development Workflow

### 1. Creating New Components
1. Create component file in appropriate directory
2. Add PropTypes or TypeScript interfaces
3. Include accessibility attributes
4. Add responsive classes
5. Write tests
6. Document usage examples

### 2. Testing
```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### 3. Building
```bash
# Development build
npm run dev

# Production build
npm run build

# Bundle analysis
npm run build:analyze
```

## Migration Guide

### From Legacy Components
1. Replace class components with functional components
2. Update prop interfaces
3. Add React.memo for performance
4. Implement proper error boundaries
5. Add accessibility attributes

### Breaking Changes
- Button component now uses rounded-xl by default
- Card component has updated shadow classes
- Form inputs have larger touch targets
- All components now support dark mode

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design System Principles](https://designsystemsrepo.com/)
