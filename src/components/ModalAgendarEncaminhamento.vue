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
            <h3>Dados do Agendamento</h3>
            
            <div class="form-group">
              <label>Unidade de Atendimento *</label>
              <select v-model="unidadeAtendimento" required @change="preencherEndereco">
                <option value="" disabled>Selecione uma unidade</option>
                <option v-for="unidade in unidades" :key="unidade.id" :value="unidade">
                  {{ unidade.nome }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Endereço *</label>
              <input type="text" v-model="enderecoAtendimento" required placeholder="Endereço completo da unidade" readonly />
            </div>

            <div class="form-group">
              <label>Médico *</label>
              <input type="text" v-model="medicoAtendimento" required placeholder="Nome do médico" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Data da Consulta *</label>
                <input type="date" v-model="dataAgendamento" required :min="dataMinima" />
              </div>

              <div class="form-group">
                <label>Horário de Atendimento *</label>
                <input type="time" v-model="horarioAtendimento" required />
              </div>
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
import { useNotification } from '@/composables/useNotification';
import { addNotification } from '@/store/notificationStore';

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
      horarioAtendimento: '',
      unidadeAtendimento: '',
      enderecoAtendimento: '',
      medicoAtendimento: '',
      unidades: [],
      carregando: false,
      notification: useNotification()
    };
  },
  mounted() {
    this.buscarUnidades();
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
        // Se já tem data agendada, preencher os campos
        if (this.encaminhamento?.data_agendamento) {
          this.dataAgendamento = this.encaminhamento.data_agendamento.split('T')[0];
        } else {
          this.dataAgendamento = '';
        }
        
        // Preencher outros campos se existirem
        this.horarioAtendimento = this.encaminhamento?.horario_atendimento || '';
        this.medicoAtendimento = this.encaminhamento?.medico_atendimento || '';
        this.enderecoAtendimento = this.encaminhamento?.endereco_atendimento || '';
        
        // Preencher unidade se existir ID
        if (this.encaminhamento?.unidade_atendimento_id && this.unidades.length > 0) {
          this.unidadeAtendimento = this.unidades.find(
            u => u.id === this.encaminhamento.unidade_atendimento_id
          ) || '';
        } else {
          this.unidadeAtendimento = '';
        }
      }
    }
  },
  methods: {
    async buscarUnidades() {
      try {
        const response = await api.get('/unidades-saude');
        this.unidades = response.data;
      } catch (error) {
        console.error('Erro ao buscar unidades:', error);
        this.notification.error('Erro ao carregar unidades de saúde.');
      }
    },
    preencherEndereco() {
      if (this.unidadeAtendimento && typeof this.unidadeAtendimento === 'object') {
        this.enderecoAtendimento = this.unidadeAtendimento.endereco || '';
      }
    },
    formatarData(data) {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    },
    async agendar() {
      // Validação de campos obrigatórios
      if (!this.dataAgendamento || !this.horarioAtendimento || !this.unidadeAtendimento || !this.medicoAtendimento) {
        this.notification.warning('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Validar se unidadeAtendimento é um objeto
      if (typeof this.unidadeAtendimento !== 'object' || !this.unidadeAtendimento.id) {
        this.notification.warning('Por favor, selecione uma unidade válida.');
        return;
      }

      this.carregando = true;

      try {
        await api.put(`/encaminhamentos/${this.encaminhamento.id}`, {
          dt_agendamento: this.dataAgendamento,
          horario_atendimento: this.horarioAtendimento,
          unidade_agendamento_id: this.unidadeAtendimento.id,
          endereco_atendimento: this.enderecoAtendimento,
          medico_atendamento: this.medicoAtendimento,
          status: 'Agendado'
        });
        
        // Criar notificação para o paciente
        addNotification({
          tipo: 'agendamento',
          titulo: 'Consulta Agendada',
          mensagem: `Sua consulta de ${this.encaminhamento.especialidade} foi agendada para ${this.formatarData(this.dataAgendamento)} às ${this.horarioAtendimento} em ${this.unidadeAtendimento.nome}.`,
          usuario_id: this.encaminhamento.usuario_id
        });
        
        this.notification.success('Agendamento realizado com sucesso!');
        this.$emit('agendado');
        this.fechar();
      } catch (error) {
        console.error('Erro ao agendar encaminhamento:', error);
        if (error.response?.status === 422) {
          this.notification.error('Dados inválidos. Verifique os campos e tente novamente.');
        } else {
          this.notification.error('Erro ao agendar encaminhamento. Tente novamente.');
        }
      } finally {
        this.carregando = false;
      }
    },
    fechar() {
      this.dataAgendamento = '';
      this.horarioAtendimento = '';
      this.unidadeAtendimento = '';
      this.enderecoAtendimento = '';
      this.medicoAtendimento = '';
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

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #1565c0;
}

.form-group select {
  cursor: pointer;
  background-color: white;
}

.form-group input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
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
  
  .form-row {
    flex-direction: column;
  }
  
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
