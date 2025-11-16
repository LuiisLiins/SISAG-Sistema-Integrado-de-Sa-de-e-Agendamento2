<template>
  <main>
    <header class="header">
      <img class="logo-cabecalho" :src="logo3" alt="Logo" />
      
      <div class="usuario-info">
        <h1>Sistema Integrado de Saúde e Agendamento</h1>
        <p>{{ userStore.nome || 'Usuário' }}</p>

        <div class="user-down">
          <p>{{ userStore.tipo || 'Tipo' }}</p>
          <i class="fi fi-rr-angle-small-down"></i>
        </div>    
      </div>    
    </header>

    <div class="linha-separadora"></div>
  </main>
</template>

<script>
import logo3 from "../assets/logo3.png";
import userStore from "@/store/userStore";

export default {
  name: "AppCabecalho",

  data() {
    return {
      logo3,
      userStore
    };
  }
};
</script>
