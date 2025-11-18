<template>
  <transition name="fade">
    <div v-if="mostrar" class="modal-overlay" @click="fechar">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Editar Unidade</h2>
          <i class="fi fi-rr-cross-small" @click="fechar"></i>
        </div>

        <form class="modal-form" @submit.prevent="salvar">
          <div class="linha">
            <div class="form-group">
              <label>Nome</label>
              <input type="text" v-model="unidadeEdit.nome" required />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Endereço</label>
              <input type="text" v-model="unidadeEdit.endereco" required />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Telefone</label>
              <input type="tel" v-model="unidadeEdit.telefone" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="unidadeEdit.email" />
            </div>
          </div>

          <div class="modal-acoes">
            <button type="button" class="btn-cancelar" @click="fechar">Cancelar</button>
            <button type="submit" class="btn-salvar" :disabled="carregando">
              {{ carregando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import api from '@/services/api';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'ModalEditaUnidade',
  props: {
    mostrar: {
      type: Boolean,
      default: false
    },
    unidade: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      unidadeEdit: {
        nome: '',
        endereco: '',
        telefone: '',
        email: ''
      },
      carregando: false,
      notification: useNotification()
    };
  },
  watch: {
    unidade: {
      immediate: true,
      handler(novaUnidade) {
        if (novaUnidade) {
          this.unidadeEdit = { ...novaUnidade };
        }
      }
    }
  },
  methods: {
    async salvar() {
      if (!this.unidadeEdit.nome || !this.unidadeEdit.endereco) {
        this.notification.warning('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      this.carregando = true;

      try {
        await api.put(`/unidades-saude/${this.unidadeEdit.id}`, this.unidadeEdit);
        this.notification.success('Unidade atualizada com sucesso!');
        this.$emit('atualizado');
        this.fechar();
      } catch (error) {
        console.error('Erro ao atualizar unidade:', error);
        if (error.response?.status === 422) {
          this.notification.error('Dados inválidos. Verifique os campos e tente novamente.');
        } else {
          this.notification.error('Erro ao atualizar unidade. Tente novamente.');
        }
      } finally {
        this.carregando = false;
      }
    },
    fechar() {
      this.$emit('fechar');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  background-color: #0d47a1;
  color: white;
  padding: 20px 25px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-header i {
  cursor: pointer;
  font-size: 24px;
  transition: transform 0.2s;
}

.modal-header i:hover {
  transform: rotate(90deg);
}

.modal-form {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.linha {
  display: flex;
  gap: 15px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #0d47a1;
  margin-bottom: 6px;
  font-size: 14px;
}

input,
select {
  padding: 10px;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

input:focus,
select:focus {
  border-color: #1565c0;
}

.modal-acoes {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-cancelar,
.btn-salvar {
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar {
  background-color: #9e9e9e;
  color: white;
}

.btn-cancelar:hover {
  background-color: #757575;
}

.btn-salvar {
  background-color: #0d47a1;
  color: white;
}

.btn-salvar:hover {
  background-color: #083b88;
}

.btn-salvar:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar customizada */
.modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.modal-container::-webkit-scrollbar-thumb {
  background-color: #90caf9;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .linha {
    flex-direction: column;
  }
  
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
