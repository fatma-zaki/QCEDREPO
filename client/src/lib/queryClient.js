import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys factory
export const queryKeys = {
  employees: {
    all: ['employees'],
    lists: () => [...queryKeys.employees.all, 'list'],
    list: (filters) => [...queryKeys.employees.lists(), filters],
    details: () => [...queryKeys.employees.all, 'detail'],
    detail: (id) => [...queryKeys.employees.details(), id],
  },
  departments: {
    all: ['departments'],
    lists: () => [...queryKeys.departments.all, 'list'],
    list: (filters) => [...queryKeys.departments.lists(), filters],
    details: () => [...queryKeys.departments.all, 'detail'],
    detail: (id) => [...queryKeys.departments.details(), id],
  },
  auth: {
    user: ['auth', 'user'],
    profile: (id) => ['auth', 'profile', id],
  },
  messages: {
    all: ['messages'],
    lists: () => [...queryKeys.messages.all, 'list'],
    list: (filters) => [...queryKeys.messages.lists(), filters],
    unread: ['messages', 'unread'],
  },
  analytics: {
    all: ['analytics'],
    dashboard: ['analytics', 'dashboard'],
    charts: (type) => ['analytics', 'charts', type],
  },
};
