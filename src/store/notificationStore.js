import { reactive } from 'vue';

export const notificationStore = reactive({
  notificacoes: loadNotifications()
});

function loadNotifications() {
  const stored = localStorage.getItem('sisag_notificacoes');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

function saveNotifications() {
  localStorage.setItem('sisag_notificacoes', JSON.stringify(notificationStore.notificacoes));
}

export function addNotification(notification) {
  const novaNotificacao = {
    id: Date.now(),
    tipo: notification.tipo || 'info',
    titulo: notification.titulo,
    mensagem: notification.mensagem,
    data: new Date().toISOString(),
    lida: false,
    ...notification
  };
  
  notificationStore.notificacoes.unshift(novaNotificacao);
  saveNotifications();
}

export function marcarComoLida(id) {
  const notif = notificationStore.notificacoes.find(n => n.id === id);
  if (notif) {
    notif.lida = true;
    saveNotifications();
  }
}

export function marcarTodasComoLidas() {
  notificationStore.notificacoes.forEach(n => n.lida = true);
  saveNotifications();
}

export function limparNotificacoes() {
  notificationStore.notificacoes = [];
  saveNotifications();
}
