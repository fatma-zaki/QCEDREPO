import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import api from './useApi';

export const useEmployees = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.employees.list(filters),
    queryFn: async () => {
      const response = await api.get('/employees', { params: filters });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployee = (id) => {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: async () => {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeData) => {
      const response = await api.post('/employees', employeeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...employeeData }) => {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.setQueryData(queryKeys.employees.detail(variables.id), data);
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

export const useExportEmployees = () => {
  return useMutation({
    mutationFn: async (format) => {
      const response = await api.get(`/employees/export/${format}`, {
        responseType: 'blob',
      });
      return response.data;
    },
  });
};
