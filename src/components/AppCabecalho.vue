<template>
  <header class="header" ref="header">
    <div class="header-content">
      <!-- Logo -->
      <img class="logo-cabecalho" :src="logo3" alt="Logo" />

      <!-- Breadcrumb centralizado -->
      <p class="breadcrumb">{{ moduloAtual }}</p>

      <!-- Usuário + Logout alinhados na base -->
      <div class="usuario-info">
        <p class="nome-usuario">{{ primeiroEUltimoNome }} | {{ userStore.tipo || 'Tipo' }}</p>
        <button class="btn-logout" @click="fazerLogout">
          <i class="fi fi-rr-sign-out-alt"></i>
          Sair
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import logo3 from "../assets/logo3.png";
import userStore, { logout } from "@/store/userStore";
import { useRouter, useRoute } from "vue-router";
import { ref, computed } from "vue";

export default {
  name: "AppCabecalho",

  setup() {
    const router = useRouter();
    const route = useRoute();
    const header = ref(null);

    const fazerLogout = () => {
      logout();
      router.push("/");
    };

    const moduloAtual = computed(() => route.meta.title || "Dashboard");

    const primeiroEUltimoNome = computed(() => {
      if (!userStore.nome) return "Usuário";
      const nomes = userStore.nome.split(" ");
      if (nomes.length === 1) return nomes[0];
      return `${nomes[0]} ${nomes[nomes.length - 1]}`;
    });

    return { logo3, userStore, fazerLogout, header, moduloAtual, primeiroEUltimoNome };
  }
};
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1565c0;
  color: #fff;
  padding: 0 60px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

/* Logo */
.logo-cabecalho {
  width: 300px;
  height: auto;
}

/* Breadcrumb centralizado */
.breadcrumb {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  padding-left: 6%;
}

/* Usuário + logout */
.usuario-info {
  display: flex;
  align-items: flex-end; /* nome alinhado na base */
  gap: 10px;
}

.nome-usuario {
  font-weight: 500;
  margin: 0;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
  align-self: center; /* botão verticalmente centralizado */
}

.btn-logout:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.btn-logout i {
  font-size: 16px;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .header {
    padding: 10px 20px;
  }

  .logo-cabecalho {
    width: 200px;
  }

  .breadcrumb {
    font-size: 1rem;
    position: static;
    transform: none;
    margin: 5px 0;
    text-align: center;
  }

  .usuario-info {
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .btn-logout {
    align-self: center;
  }
}
</style>
