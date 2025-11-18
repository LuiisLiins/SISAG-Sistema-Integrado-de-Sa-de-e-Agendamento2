<template>
  <transition name="fade">
    <div v-if="mostrar" class="modal-overlay" @click="fechar">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Editar Encaminhamento</h2>
          <i class="fi fi-rr-cross-small" @click="fechar"></i>
        </div>

        <form class="modal-form" @submit.prevent="salvar">
          <div class="linha">
            <div class="form-group">
              <label>Paciente</label>
              <input type="text" :value="encaminhamentoEdit.usuario?.nome" disabled />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Data de Solicitação</label>
              <input type="date" v-model="encaminhamentoEdit.data_solicitacao" required />
            </div>
            <div class="form-group">
              <label>Unidade de Saúde</label>
              <select v-model="unidadeId" required>
                <option value="">Selecione uma unidade</option>
                <option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">
                  {{ unidade.nome }}
                </option>
              </select>
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Consulta / Especialidade</label>
              <input type="text" v-model="encaminhamentoEdit.especialidade" />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Nível de Urgência</label>
              <select v-model="encaminhamentoEdit.nivel_urgencia" required>
                <option value="">Selecione</option>
                <option value="eletivo">Eletivo</option>
                <option value="prioritario">Prioritario</option>
                <option value="emergente">Emergente</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="encaminhamentoEdit.status" required>
                <option value="">Selecione</option>
                <option value="Pendente">Pendente</option>
                <option value="Perdido">Perdido</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Agendado">Realizado</option>
                <option value="Concluido">Concluído</option>
              </select>
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Observações</label>
              <textarea v-model="encaminhamentoEdit.observacoes" rows="4"></textarea>
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
  name: 'ModalEditaEncaminhamento',
  props: {
    mostrar: {
      type: Boolean,
      default: false
    },
    encaminhamento: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      encaminhamentoEdit: {
        usuario: null,
        data_solicitacao: '',
        unidade_saude_id: '',
        especialidade: '',
        nivel_urgencia: '',
        status: '',
        observacoes: ''
      },
      unidades: [],
      carregando: false,
      notification: useNotification()
    };
  },
  computed: {
    unidadeId: {
      get() {
        return this.encaminhamentoEdit.unidade?.id || this.encaminhamentoEdit.unidade_saude_id || '';
      },
      set(id) {
        const unidadeSelecionada = this.unidades.find(u => u.id === id);
        if (unidadeSelecionada) {
          this.encaminhamentoEdit.unidade = { ...unidadeSelecionada };
        }
      }
    }
  },
  watch: {
    encaminhamento: {
      immediate: true,
      handler(novoEncaminhamento) {
        if (novoEncaminhamento) {
          this.encaminhamentoEdit = { 
            ...novoEncaminhamento,
            unidade_saude_id: novoEncaminhamento.unidade?.id || novoEncaminhamento.unidade_saude_id
          };
          // Formatar data para input type="date"
          if (this.encaminhamentoEdit.data_solicitacao) {
            this.encaminhamentoEdit.data_solicitacao = this.encaminhamentoEdit.data_solicitacao.split('T')[0];
          }
        }
      }
    },
    mostrar(valor) {
      if (valor && this.unidades.length === 0) {
        this.carregarUnidades();
      }
    }
  },
  methods: {
    async carregarUnidades() {
      try {
        const res = await api.get('/unidades-saude');
        this.unidades = res.data || [];
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        this.unidades = [];
      }
    },
    async salvar() {
      if (!this.encaminhamentoEdit.data_solicitacao || !this.encaminhamentoEdit.unidade || !this.encaminhamentoEdit.nivel_urgencia || !this.encaminhamentoEdit.status) {
        this.notification.warning('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      this.carregando = true;

      try {
        await api.put(`/encaminhamentos/${this.encaminhamentoEdit.id}`, {
          data_solicitacao: this.encaminhamentoEdit.data_solicitacao,
          unidade_id: this.encaminhamentoEdit.unidade.id,
          especialidade: this.encaminhamentoEdit.especialidade,
          nivel_urgencia: this.encaminhamentoEdit.nivel_urgencia,
          status: this.encaminhamentoEdit.status,
          observacoes: this.encaminhamentoEdit.observacoes
        });
        this.notification.success('Encaminhamento atualizado com sucesso!');
        this.$emit('atualizado');
        this.fechar();
      } catch (error) {
        console.error('Erro ao atualizar encaminhamento:', error);
        if (error.response?.status === 422) {
          this.notification.error('Dados inválidos. Verifique os campos e tente novamente.');
        } else {
          this.notification.error('Erro ao atualizar encaminhamento. Tente novamente.');
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
select,
textarea {
  padding: 10px;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #1565c0;
}

textarea {
  resize: vertical;
  min-height: 80px;
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
