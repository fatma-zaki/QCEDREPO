import { useState, useCallback } from 'react';

/**
 * Universal modal management hook
 * Handles modal state, data, and common modal operations
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);

  const openModal = useCallback((data = null, type = null) => {
    setModalData(data);
    setModalType(type);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalData(null);
    setModalType(null);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    modalData,
    modalType,
    openModal,
    closeModal,
    toggleModal,
    setModalData,
    setModalType
  };
};

/**
 * Hook for managing multiple modals
 */
export const useMultipleModals = (modalNames = []) => {
  const [modals, setModals] = useState(
    modalNames.reduce((acc, name) => ({
      ...acc,
      [name]: { isOpen: false, data: null, type: null }
    }), {})
  );

  const openModal = useCallback((name, data = null, type = null) => {
    setModals(prev => ({
      ...prev,
      [name]: { isOpen: true, data, type }
    }));
  }, []);

  const closeModal = useCallback((name) => {
    setModals(prev => ({
      ...prev,
      [name]: { isOpen: false, data: null, type: null }
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const newModals = {};
      Object.keys(prev).forEach(name => {
        newModals[name] = { isOpen: false, data: null, type: null };
      });
      return newModals;
    });
  }, []);

  const getModalState = useCallback((name) => {
    return modals[name] || { isOpen: false, data: null, type: null };
  }, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    getModalState
  };
};

/**
 * Hook for confirmation dialogs
 */
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
    variant: 'danger'
  });

  const showConfirm = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    setIsOpen(true);
  }, []);

  const hideConfirm = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    hideConfirm();
  }, [config.onConfirm, hideConfirm]);

  const handleCancel = useCallback(() => {
    if (config.onCancel) {
      config.onCancel();
    }
    hideConfirm();
  }, [config.onCancel, hideConfirm]);

  return {
    isOpen,
    config,
    showConfirm,
    hideConfirm,
    handleConfirm,
    handleCancel
  };
};

/**
 * Hook for managing form modals
 */
export const useFormModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [formType, setFormType] = useState('create'); // 'create' | 'edit'
  const [onSubmit, setOnSubmit] = useState(null);
  const [onCancel, setOnCancel] = useState(null);

  const openCreateModal = useCallback((submitCallback = null, cancelCallback = null) => {
    setFormData(null);
    setFormType('create');
    setOnSubmit(() => submitCallback);
    setOnCancel(() => cancelCallback);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((data, submitCallback = null, cancelCallback = null) => {
    setFormData(data);
    setFormType('edit');
    setOnSubmit(() => submitCallback);
    setOnCancel(() => cancelCallback);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setFormData(null);
    setFormType('create');
    setOnSubmit(null);
    setOnCancel(null);
  }, []);

  const handleSubmit = useCallback(async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
    closeModal();
  }, [onSubmit, closeModal]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    closeModal();
  }, [onCancel, closeModal]);

  return {
    isOpen,
    formData,
    formType,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleCancel
  };
};

/**
 * Hook for managing drawer/sidebar modals
 */
export const useDrawer = (position = 'right') => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerData, setDrawerData] = useState(null);

  const openDrawer = useCallback((data = null) => {
    setDrawerData(data);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setDrawerData(null);
  }, []);

  return {
    isOpen,
    drawerData,
    position,
    openDrawer,
    closeDrawer
  };
};

/**
 * Hook for managing toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, duration: 0, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };
};

export default useModal;
