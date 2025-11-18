<template>
  <transition name="fade">
    <div v-if="mostrar" class="modal-overlay" @click="fechar">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Agendar Encaminhamento</h2>
          <i class="fi fi-rr-cross-small" @click="fechar"></i>
        </div>

        <div class="modal-content">
          <!-- Dados do Encaminhamento -->
          <div class="info-section">
            <h3>Dados do Encaminhamento</h3>
            
            <div class="info-linha">
              <div class="info-item">
                <label>Paciente:</label>
                <span>{{ encaminhamento?.usuario?.nome || '-' }}</span>
              </div>
            </div>

            <div class="info-linha">
              <div class="info-item">
                <label>Data de Solicitação:</label>
                <span>{{ formatarData(encaminhamento?.data_solicitacao) }}</span>
              </div>
              <div class="info-item">
                <label>Especialidade:</label>
                <span>{{ encaminhamento?.especialidade || '-' }}</span>
              </div>
            </div>

            <div class="info-linha">
              <div class="info-item">
                <label>Unidade de Saúde Solicitante:</label>
                <span>{{ encaminhamento?.unidade?.nome || '-' }}</span>
              </div>
              <div class="info-item">
                <label>Prioridade:</label>
                <span>{{ encaminhamento?.nivel_urgencia || '-' }}</span>
              </div>
            </div>

            <div class="info-linha" v-if="encaminhamento?.observacoes">
              <div class="info-item full">
                <label>Observações:</label>
                <span>{{ encaminhamento.observacoes }}</span>
              </div>
            </div>
          </div>

          <!-- Formulário de Agendamento -->
          <form class="form-section" @submit.prevent="agendar">
            <h3>Data do Agendamento</h3>
            
            <div class="form-group">
              <label>Selecione a data da consulta *</label>
              <input type="date" v-model="dataAgendamento" required :min="dataMinima" />
            </div>

            <div class="modal-acoes">
              <button type="button" class="btn-cancelar" @click="fechar">Cancelar</button>
              <button type="submit" class="btn-agendar" :disabled="carregando">
                {{ carregando ? 'Agendando...' : 'Confirmar Agendamento' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ModalAgendarEncaminhamento',
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
      dataAgendamento: '',
      carregando: false
    };
  },
  computed: {
    dataMinima() {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    }
  },
  watch: {
    mostrar(valor) {
      if (valor) {
        // Se já tem data agendada, preencher o campo
        if (this.encaminhamento?.data_agendamento) {
          this.dataAgendamento = this.encaminhamento.data_agendamento.split('T')[0];
        } else {
          this.dataAgendamento = '';
        }
      }
    }
  },
  methods: {
    formatarData(data) {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    },
    async agendar() {
      if (!this.dataAgendamento) {
        alert('Por favor, selecione uma data para o agendamento.');
        return;
      }

      this.carregando = true;

      try {
        await api.put(`/encaminhamentos/${this.encaminhamento.id}`, {
          ...this.encaminhamento,
          dt_agendamento: this.dataAgendamento,
          status: 'Agendado'
        });
        alert('Agendamento realizado com sucesso!');
        this.$emit('agendado');
        this.fechar();
      } catch (error) {
        console.error('Erro ao agendar encaminhamento:', error);
        if (error.response?.status === 422) {
          alert('Dados inválidos. Verifique a data e tente novamente.');
        } else {
          alert('Erro ao agendar encaminhamento. Tente novamente.');
        }
      } finally {
        this.carregando = false;
      }
    },
    fechar() {
      this.dataAgendamento = '';
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

.modal-content {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-section h3,
.form-section h3 {
  color: #0d47a1;
  font-size: 18px;
  margin-bottom: 15px;
  border-bottom: 2px solid #bbdefb;
  padding-bottom: 8px;
}

.info-linha {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full {
  flex: 1 1 100%;
}

.info-item label {
  font-weight: 600;
  color: #0d47a1;
  font-size: 13px;
}

.info-item span {
  color: #333;
  font-size: 14px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.form-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  font-weight: 600;
  color: #0d47a1;
  font-size: 14px;
}

.form-group input {
  padding: 12px;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #1565c0;
}

.modal-acoes {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-cancelar,
.btn-agendar {
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

.btn-agendar {
  background-color: #2e7d32;
  color: white;
}

.btn-agendar:hover {
  background-color: #1b5e20;
}

.btn-agendar:disabled {
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
  .info-linha {
    flex-direction: column;
    gap: 12px;
  }
  
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
