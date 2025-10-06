import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useApi } from './useApi';

/**
 * Universal data fetching hook with caching and error handling
 */
export const useDataFetching = (config) => {
  const {
    fetchAction,
    selector,
    dependencies = [],
    autoFetch = true,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    onSuccess,
    onError,
    retryOnError = true,
    maxRetries = 3
  } = config;

  const dispatch = useDispatch();
  const { execute } = useApi();
  const data = useSelector(selector);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check if data is cached and still valid
  const isDataCached = useCallback(() => {
    if (!cacheKey) return false;
    
    const cached = localStorage.getItem(`cache_${cacheKey}`);
    if (!cached) return false;
    
    const { timestamp, data: cachedData } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > cacheDuration;
    
    return !isExpired && cachedData;
  }, [cacheKey, cacheDuration]);

  // Cache data
  const cacheData = useCallback((dataToCache) => {
    if (!cacheKey) return;
    
    localStorage.setItem(`cache_${cacheKey}`, JSON.stringify({
      timestamp: Date.now(),
      data: dataToCache
    }));
  }, [cacheKey]);

  // Fetch data
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && isDataCached()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (fetchAction) {
        // Redux action
        result = await dispatch(fetchAction());
      } else if (config.apiCall) {
        // Direct API call
        result = await execute(config.apiCall);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      // Cache the data
      if (cacheKey && result) {
        cacheData(result);
      }

      setRetryCount(0);
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      }

      // Retry logic
      if (retryOnError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchData(true);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [
    fetchAction,
    config.apiCall,
    execute,
    dispatch,
    onSuccess,
    onError,
    retryOnError,
    maxRetries,
    retryCount,
    isDataCached,
    cacheData,
    cacheKey
  ]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    if (cacheKey) {
      localStorage.removeItem(`cache_${cacheKey}`);
    }
  }, [cacheKey]);

  // Auto fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    retryCount,
    refresh,
    clearCache,
    fetchData
  };
};

/**
 * Hook for managing multiple data sources
 */
export const useMultipleDataFetching = (configs) => {
  const results = configs.map(config => useDataFetching(config));
  
  const isLoading = results.some(result => result.loading);
  const hasError = results.some(result => result.error);
  const errors = results.map(result => result.error).filter(Boolean);

  const refreshAll = useCallback(() => {
    results.forEach(result => result.refresh());
  }, [results]);

  const clearAllCache = useCallback(() => {
    results.forEach(result => result.clearCache());
  }, [results]);

  return {
    results,
    isLoading,
    hasError,
    errors,
    refreshAll,
    clearAllCache
  };
};

/**
 * Hook for paginated data fetching
 */
export const usePaginatedData = (config) => {
  const {
    fetchAction,
    selector,
    pageSize = 10,
    initialPage = 1
  } = config;

  const dispatch = useDispatch();
  const data = useSelector(selector);
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async (page) => {
    setLoading(true);
    setError(null);

    try {
      const result = await dispatch(fetchAction({
        page,
        limit: pageSize
      }));

      if (result.payload) {
        const { data: items, total, pages } = result.payload;
        setTotalItems(total);
        setTotalPages(pages);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch, fetchAction, pageSize]);

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
    fetchPage(page);
  }, [fetchPage]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Fetch initial page
  useEffect(() => {
    fetchPage(initialPage);
  }, [fetchPage, initialPage]);

  return {
    data,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    fetchPage
  };
};

/**
 * Hook for search and filtering
 */
export const useSearchAndFilter = (data, config) => {
  const {
    searchFields = [],
    filterFields = {},
    sortFields = {},
    defaultSort = null
  } = config;

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(defaultSort?.field || '');
  const [sortOrder, setSortOrder] = useState(defaultSort?.order || 'asc');

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = getNestedValue(item, field);
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        filtered = filtered.filter(item => {
          const itemValue = getNestedValue(item, field);
          return itemValue === value;
        });
      }
    });

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortBy, sortOrder, searchFields]);

  const updateSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const updateFilter = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setSortBy(defaultSort?.field || '');
    setSortOrder(defaultSort?.order || 'asc');
  }, [defaultSort]);

  return {
    filteredData,
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    updateSearch,
    updateFilter,
    updateSort,
    clearFilters
  };
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export default useDataFetching;
