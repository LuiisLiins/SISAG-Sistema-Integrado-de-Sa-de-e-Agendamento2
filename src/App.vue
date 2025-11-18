<template>
  <div id="app">
    <router-view />
    <ToastNotification />
  </div>
</template>

<script>
import ToastNotification from '@/components/ToastNotification.vue';

export default {
  name: 'App',
  components: {
    ToastNotification
  }
};
</script>