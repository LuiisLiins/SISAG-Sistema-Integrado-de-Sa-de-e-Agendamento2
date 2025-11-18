import { reactive } from 'vue';

export const notificationState = reactive({
  notifications: []
});

let notificationId = 0;

export const useNotification = () => {
  const showNotification = (message, type = 'info', duration = 4000) => {
    const id = ++notificationId;
    
    notificationState.notifications.push({
      id,
      message,
      type
    });

    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const success = (message, duration) => {
    showNotification(message, 'success', duration);
  };

  const error = (message, duration) => {
    showNotification(message, 'error', duration);
  };

  const warning = (message, duration) => {
    showNotification(message, 'warning', duration);
  };

  const info = (message, duration) => {
    showNotification(message, 'info', duration);
  };

  return {
    success,
    error,
    warning,
    info
  };
};

export const removeNotification = (id) => {
  const index = notificationState.notifications.findIndex(n => n.id === id);
  if (index > -1) {
    notificationState.notifications.splice(index, 1);
  }
};
