import { useNotifications as useNotificationContext } from '../components/NotificationSystem'

export const useNotifications = () => {
  const notificationContext = useNotificationContext()
  
  const showSuccess = (message, options = {}) => {
    notificationContext.success(message, options)
  }

  const showError = (message, options = {}) => {
    notificationContext.error(message, options)
  }

  const showWarning = (message, options = {}) => {
    notificationContext.warning(message, options)
  }

  const showInfo = (message, options = {}) => {
    notificationContext.info(message, options)
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ...notificationContext
  }
}
