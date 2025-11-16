<template>
  <main>
    <div class="menu-lateral">
      <img class="logo-lateral" :src="logo2" alt="Logo" />

      <div class="icone" @click="$router.push('/menu/inicial')">
        <i class="fi fi-rr-home"></i>
      </div>

      <div class="icone" @click="$router.push('/menu/agendamentos')">
        <i class="fi fi-rr-doctor"></i>
      </div>

      <div class="icone" @click="$router.push('/menu/cadastro')">
        <i class="fi fi-rr-user-add"></i>
      </div>

      <!-- Novo ícone para Meus Pacientes -->
      <div class="icone"  v-if="userStore.tipo === 'agente' || userStore.tipo === 'admin'" @click="$router.push('/menu/meus-pacientes')">
        <i class="fi fi-rr-users"></i> <!-- ícone de grupo/pacientes -->
      </div>


      <div class="icone" v-if="userStore.tipo === 'admin'" @click="toggleMenuAdicionar">
        <i class="fi fi-rr-plus"></i> <!-- ícone de adição correto -->
      </div>

      <!-- Menu dropdown para adicionar -->
      <transition name="fade">
        <div v-if="mostrarMenuAdicionar" class="menu-dropdown" @click="fecharMenu">
          <div class="dropdown-opcoes" @click.stop>
            <div class="dropdown-header">
              <span>O que deseja fazer?</span>
              <i class="fi fi-rr-cross-small" @click="fecharMenu"></i>
            </div>
            <div class="dropdown-item" @click="irPara('/menu/adicionar-usuario')">
              <i class="fi fi-rr-user-add"></i>
              <span>Adicionar Usuário</span>
            </div>
            <div class="dropdown-item" @click="irPara('/menu/adicionar')">
              <i class="fi fi-rr-users"></i>
              <span>Adicionar encaminhamento</span>
            </div>
          </div>
        </div>
      </transition>

      <div class="icone" v-if="userStore.tipo === 'agente' || userStore.tipo === 'admin'" @click="$router.push('/menu/encaminhamentos-ubs')">
        <i class="fi fi-rr-list-timeline"></i>
      </div>    
      
    </div>
  </main>
</template>

<script>
import logo2 from '../assets/logo2.png';
import userStore from '../store/userStore.js';

export default {
  name: 'MenuLateral',

  data() {
    return {
      logo2,
      userStore,
      mostrarMenuAdicionar: false
    }
  },
  methods: {
    toggleMenuAdicionar() {
      this.mostrarMenuAdicionar = !this.mostrarMenuAdicionar;
    },
    fecharMenu() {
      this.mostrarMenuAdicionar = false;
    },
    irPara(rota) {
      this.mostrarMenuAdicionar = false;
      this.$router.push(rota);
    }
  }
};
</script>

<style scoped>
.menu-dropdown {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dropdown-opcoes {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  background-color: #0d47a1;
  color: white;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.dropdown-header i {
  cursor: pointer;
  font-size: 20px;
  transition: transform 0.2s;
}

.dropdown-header i:hover {
  transform: rotate(90deg);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e0e0e0;
}

.dropdown-item:last-child {
  border-bottom: none;
  border-radius: 0 0 12px 12px;
}

.dropdown-item:hover {
  background-color: #e3f2fd;
  padding-left: 25px;
}

.dropdown-item i {
  font-size: 20px;
  color: #0d47a1;
}

.dropdown-item span {
  color: #333;
  font-weight: 500;
  font-size: 15px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>