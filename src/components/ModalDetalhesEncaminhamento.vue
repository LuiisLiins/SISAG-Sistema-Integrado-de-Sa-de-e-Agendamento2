<template>
  <transition name="fade">
    <div v-if="mostrar" class="modal-overlay" @click="fechar">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Detalhes do Encaminhamento</h2>
          <i class="fi fi-rr-cross-small" @click="fechar"></i>
        </div>

        <div class="modal-content" v-if="encaminhamento">
          <!-- Informações Principais -->
          <div class="info-section">
            <h3><i class="fi fi-rr-stethoscope"></i> Informações da Consulta</h3>
            
            <div class="info-grid">
              <div class="info-item">
                <label>Especialidade:</label>
                <span>{{ encaminhamento.especialidade || '-' }}</span>
              </div>
              
              <div class="info-item">
                <label>Status:</label>
                <span class="badge-status" :class="getStatusClass(encaminhamento.status)">
                  {{ encaminhamento.status || 'Pendente' }}
                </span>
              </div>
              
              <div class="info-item">
                <label>Prioridade:</label>
                <span class="badge-prioridade" :class="getPrioridadeClass(encaminhamento.nivel_urgencia)">
                  {{ encaminhamento.nivel_urgencia || '-' }}
                </span>
              </div>
              
              <div class="info-item" v-if="encaminhamento.medico">
                <label>Médico:</label>
                <span>{{ encaminhamento.medico }}</span>
              </div>
            </div>
          </div>

          <!-- Datas -->
          <div class="info-section">
            <h3><i class="fi fi-rr-calendar"></i> Datas</h3>
            
            <div class="info-grid">
              <div class="info-item">
                <label>Data de Solicitação:</label>
                <span>{{ formatarData(encaminhamento.data_solicitacao) }}</span>
              </div>
              
              <div class="info-item">
                <label>Data do Agendamento:</label>
                <span v-if="encaminhamento.data_agendamento" class="destaque">
                  {{ formatarDataHora(encaminhamento.data_agendamento) }}
                </span>
                <span v-else class="aguardando">Aguardando agendamento</span>
              </div>
            </div>
          </div>

          <!-- Local -->
          <div class="info-section" v-if="encaminhamento.unidade">
            <h3><i class="fi fi-rr-hospital"></i> Local do Atendimento</h3>
            
            <div class="info-grid">
              <div class="info-item full">
                <label>Unidade de Saúde:</label>
                <span>{{ encaminhamento.unidade.nome }}</span>
              </div>
              
              <div class="info-item" v-if="encaminhamento.unidade.endereco">
                <label>Endereço:</label>
                <span>{{ encaminhamento.unidade.endereco }}</span>
              </div>
              
              <div class="info-item" v-if="encaminhamento.unidade.telefone">
                <label>Telefone:</label>
                <span>{{ formatarTelefone(encaminhamento.unidade.telefone) }}</span>
              </div>
            </div>
          </div>

          <!-- Transporte -->
          <div class="info-section" v-if="encaminhamento.precisa_transporte">
            <h3><i class="fi fi-rr-bus"></i> Transporte</h3>
            <div class="alerta-info">
              <i class="fi fi-rr-info"></i>
              <span>Transporte solicitado para esta consulta</span>
            </div>
          </div>

          <!-- Observações -->
          <div class="info-section" v-if="encaminhamento.observacoes">
            <h3><i class="fi fi-rr-file-edit"></i> Observações</h3>
            <div class="observacoes-box">
              {{ encaminhamento.observacoes }}
            </div>
          </div>
          <p>Vá ao posto de saude solicitante buscar o encaminhamento.</p>

        </div>

        <div class="modal-footer">
          <div class="footer-actions">
            <button 
              v-if="encaminhamento?.status === 'Agendado'" 
              class="btn-confirmar" 
              @click="confirmarPresenca"
            >
              <i class="fi fi-rr-check"></i>
              Confirmar Presença
            </button>
            
            <button 
              v-if="['Pendente', 'Agendado'].includes(encaminhamento?.status)" 
              class="btn-cancelar" 
              @click="cancelarEncaminhamento"
            >
              <i class="fi fi-rr-cross-circle"></i>
              Cancelar
            </button>
          </div>
          
          <button class="btn-fechar" @click="fechar">
            <i class="fi fi-rr-cross"></i>
            Fechar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ModalDetalhesEncaminhamento',
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
  methods: {
    fechar() {
      this.$emit('fechar');
    },
    async confirmarPresenca() {
      if (!this.encaminhamento?.id) return;
      
      if (!confirm('Deseja confirmar sua presença neste encaminhamento?')) {
        return;
      }

      try {
        await axios.put(`http://localhost:8000/api/encaminhamentos/${this.encaminhamento.id}`, {
          ...this.encaminhamento,
          status: 'Confirmado'
        });
        
        alert('Presença confirmada com sucesso!');
        this.$emit('atualizar');
        this.fechar();
      } catch (error) {
        console.error('Erro ao confirmar presença:', error);
        alert('Erro ao confirmar presença. Tente novamente.');
      }
    },
    async cancelarEncaminhamento() {
      if (!this.encaminhamento?.id) return;
      
      if (!confirm('Deseja realmente cancelar este encaminhamento?')) {
        return;
      }

      try {
        await axios.put(`http://localhost:8000/api/encaminhamentos/${this.encaminhamento.id}`, {
          ...this.encaminhamento,
          status: 'Cancelado'
        });
        
        alert('Encaminhamento cancelado com sucesso!');
        this.$emit('atualizar');
        this.fechar();
      } catch (error) {
        console.error('Erro ao cancelar encaminhamento:', error);
        alert('Erro ao cancelar encaminhamento. Tente novamente.');
      }
    },
    formatarData(data) {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    },
    formatarDataHora(dataHora) {
      if (!dataHora) return '-';
      const [data, hora] = dataHora.split('T');
      const [ano, mes, dia] = data.split('-');
      const horaFormatada = hora ? hora.substring(0, 5) : '';
      return `${dia}/${mes}/${ano}${horaFormatada ? ' às ' + horaFormatada : ''}`;
    },
    formatarTelefone(telefone) {
      if (!telefone) return '-';
      const apenasNumeros = telefone.replace(/\D/g, '');
      if (apenasNumeros.length === 11) {
        return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (apenasNumeros.length === 10) {
        return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return telefone;
    },
    getStatusClass(status) {
      const classes = {
        'Pendente': 'status-pendente',
        'Agendado': 'status-agendado',
        'Concluido': 'status-concluido',
        'Cancelado': 'status-cancelado',
        'Perdido': 'status-perdido'
      };
      return classes[status] || 'status-pendente';
    },
    getPrioridadeClass(prioridade) {
      const classes = {
        'urgente': 'prioridade-urgente',
        'emergente': 'prioridade-emergente',
        'prioritario': 'prioridade-prioritario',
        'eletivo': 'prioridade-eletivo'
      };
      return classes[prioridade] || '';
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
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  color: white;
  padding: 25px 30px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.modal-header i {
  cursor: pointer;
  font-size: 28px;
  transition: transform 0.2s;
}

.modal-header i:hover {
  transform: rotate(90deg);
}

.modal-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.info-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0d47a1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-section h3 i {
  font-size: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.info-item .destaque {
  color: #1565c0;
  font-weight: 600;
  font-size: 16px;
}

.info-item .aguardando {
  color: #ff9800;
  font-style: italic;
}

.badge-status,
.badge-prioridade {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.badge-status.status-pendente {
  background-color: #fff3e0;
  color: #f57c00;
}

.badge-status.status-agendado {
  background-color: #e3f2fd;
  color: #1565c0;
}

.badge-status.status-concluido {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.badge-status.status-cancelado {
  background-color: #f5f5f5;
  color: #616161;
}

.badge-status.status-perdido {
  background-color: #ffebee;
  color: #c62828;
}

.badge-prioridade.prioridade-urgente {
  background-color: #ffebee;
  color: #c62828;
}

.badge-prioridade.prioridade-emergente {
  background-color: #fff3e0;
  color: #f57c00;
}

.badge-prioridade.prioridade-prioritario {
  background-color: #fff9c4;
  color: #f57f17;
}

.badge-prioridade.prioridade-eletivo {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.alerta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 8px;
}

.alerta-info i {
  font-size: 24px;
  color: #2196f3;
}

.alerta-info span {
  color: #1565c0;
  font-weight: 500;
}

.observacoes-box {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.footer-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-fechar,
.btn-confirmar,
.btn-cancelar {
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-fechar {
  background-color: #757575;
  color: white;
}

.btn-fechar:hover {
  background-color: #616161;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(97, 97, 97, 0.3);
}

.btn-confirmar {
  background-color: #2e7d32;
  color: white;
}

.btn-confirmar:hover {
  background-color: #1b5e20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
}

.btn-cancelar {
  background-color: #d32f2f;
  color: white;
}

.btn-cancelar:hover {
  background-color: #c62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3);
}

.btn-fechar i,
.btn-confirmar i,
.btn-cancelar i {
  font-size: 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-content {
    padding: 20px;
  }
}
</style>
