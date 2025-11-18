<template>
  <transition-group name="toast-list" tag="div" class="toast-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="['toast', `toast-${notification.type}`]"
      @click="removeNotification(notification.id)"
    >
      <div class="toast-icon">
        <i :class="getIcon(notification.type)"></i>
      </div>
      <div class="toast-content">
        <p class="toast-message">{{ notification.message }}</p>
      </div>
      <button class="toast-close" @click.stop="removeNotification(notification.id)">
        <i class="fi fi-rr-cross-small"></i>
      </button>
    </div>
  </transition-group>
</template>

<script>
import { notificationState, removeNotification } from '@/composables/useNotification';

export default {
  name: 'ToastNotification',
  setup() {
    const getIcon = (type) => {
      const icons = {
        success: 'fi fi-rr-check-circle',
        error: 'fi fi-rr-cross-circle',
        warning: 'fi fi-rr-exclamation',
        info: 'fi fi-rr-info'
      };
      return icons[type] || icons.info;
    };

    return {
      notifications: notificationState.notifications,
      removeNotification,
      getIcon
    };
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  max-width: 450px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

.toast-success {
  border-left-color: #2e7d32;
  background: linear-gradient(to right, #e8f5e9 0%, white 15%);
}

.toast-error {
  border-left-color: #d32f2f;
  background: linear-gradient(to right, #ffebee 0%, white 15%);
}

.toast-warning {
  border-left-color: #f57c00;
  background: linear-gradient(to right, #fff3e0 0%, white 15%);
}

.toast-info {
  border-left-color: #1565c0;
  background: linear-gradient(to right, #e3f2fd 0%, white 15%);
}

.toast-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 18px;
}

.toast-success .toast-icon {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.toast-error .toast-icon {
  background-color: #ffebee;
  color: #d32f2f;
}

.toast-warning .toast-icon {
  background-color: #fff3e0;
  color: #f57c00;
}

.toast-info .toast-icon {
  background-color: #e3f2fd;
  color: #1565c0;
}

.toast-content {
  flex: 1;
}

.toast-message {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
  padding: 0;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

.toast-close i {
  font-size: 20px;
}

/* Animações */
.toast-list-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-list-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@media (max-width: 768px) {
  .toast-container {
    top: 110px;
    right: 10px;
    left: 10px;
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>
